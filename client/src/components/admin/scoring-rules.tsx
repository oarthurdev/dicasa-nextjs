import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScoringRules, createScoringRule, updateScoringRule } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash, Edit } from 'lucide-react';
import { ScoringRule } from '@shared/schema';

export default function ScoringRules() {
  const { data: rules, isLoading } = useQuery({
    queryKey: ['/api/admin/rules'],
    queryFn: getScoringRules,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);
  const [newRule, setNewRule] = useState({
    nome: '',
    descricao: '',
    pontos: 1,
    tipo: 'positive',
    ativo: true
  });
  
  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: createScoringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rules'] });
      toast({
        title: 'Regra criada',
        description: 'A regra de pontuação foi criada com sucesso.',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao criar regra: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Update rule mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, rule }: { id: number; rule: Partial<ScoringRule> }) => 
      updateScoringRule(id, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rules'] });
      toast({
        title: 'Regra atualizada',
        description: 'A regra de pontuação foi atualizada com sucesso.',
      });
      setIsDialogOpen(false);
      setEditingRule(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar regra: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Toggle rule active status
  const toggleRuleStatus = (rule: ScoringRule) => {
    updateMutation.mutate({
      id: rule.id,
      rule: { ativo: !rule.ativo }
    });
  };
  
  // Handle edit rule
  const handleEditRule = (rule: ScoringRule) => {
    setEditingRule(rule);
    setNewRule({
      nome: rule.nome,
      descricao: rule.descricao || '',
      pontos: rule.pontos,
      tipo: rule.tipo,
      ativo: rule.ativo
    });
    setIsDialogOpen(true);
  };
  
  // Handle save rule
  const handleSaveRule = () => {
    if (!newRule.nome) {
      toast({
        title: 'Validação',
        description: 'O nome da regra é obrigatório',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingRule) {
      updateMutation.mutate({
        id: editingRule.id,
        rule: newRule
      });
    } else {
      createMutation.mutate(newRule as any);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setNewRule({
      nome: '',
      descricao: '',
      pontos: 1,
      tipo: 'positive',
      ativo: true
    });
    setEditingRule(null);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Regras de Pontuação</CardTitle>
            <CardDescription>
              Configure as regras que definem a pontuação dos corretores
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRule(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Editar Regra' : 'Nova Regra de Pontuação'}
                </DialogTitle>
                <DialogDescription>
                  {editingRule
                    ? 'Altere os detalhes da regra existente'
                    : 'Defina uma nova regra para cálculo de pontuação dos corretores'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome da Regra</Label>
                  <Input
                    id="nome"
                    value={newRule.nome}
                    onChange={(e) => setNewRule({ ...newRule, nome: e.target.value })}
                    placeholder="Ex: Lead respondido em até 1 hora"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={newRule.descricao}
                    onChange={(e) => setNewRule({ ...newRule, descricao: e.target.value })}
                    placeholder="Descreva o propósito da regra"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pontos">Pontos</Label>
                    <Input
                      id="pontos"
                      type="number"
                      value={newRule.pontos}
                      onChange={(e) => setNewRule({ ...newRule, pontos: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={newRule.tipo}
                      onValueChange={(value) => setNewRule({ ...newRule, tipo: value })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positivo (Adiciona pontos)</SelectItem>
                        <SelectItem value="negative">Negativo (Remove pontos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={newRule.ativo}
                    onCheckedChange={(checked) => setNewRule({ ...newRule, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Regra ativa</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveRule}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules && rules.length > 0 ? (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.nome}</TableCell>
                    <TableCell>{rule.descricao || '-'}</TableCell>
                    <TableCell>{rule.pontos}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.tipo === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rule.tipo === 'positive' ? 'Positivo' : 'Negativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.ativo}
                        onCheckedChange={() => toggleRuleStatus(rule)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                    Nenhuma regra encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="bg-primary-800/30 text-sm text-neutral-400 py-2">
        As regras determinam como os pontos são calculados para cada corretor.
      </CardFooter>
    </Card>
  );
}
