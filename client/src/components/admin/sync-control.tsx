import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSyncStatus, triggerSync } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Check, AlertCircle, Clock } from 'lucide-react';

export default function SyncControl() {
  const { toast } = useToast();
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Get sync status
  const { 
    data: syncStatus, 
    isLoading: isStatusLoading,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['/api/admin/sync/status'],
    queryFn: getSyncStatus,
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Trigger sync mutation
  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onMutate: () => {
      setSyncInProgress(true);
      toast({
        title: 'Sincronização iniciada',
        description: 'A sincronização com a API da Kommo foi iniciada.',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sincronização concluída',
        description: 'Os dados foram sincronizados com sucesso.',
      });
      refetchStatus();
      
      // Set a timeout to show sync in progress for at least 5 seconds
      // to avoid UI flickering for quick syncs
      setTimeout(() => {
        setSyncInProgress(false);
      }, 5000);
    },
    onError: (error) => {
      setSyncInProgress(false);
      toast({
        title: 'Erro de sincronização',
        description: `Falha ao sincronizar: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSync = () => {
    syncMutation.mutate();
  };
  
  function formatSyncTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // If less than a minute
    if (diffMs < 60000) {
      return 'Agora mesmo';
    }
    
    // If less than an hour
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `Há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    // If less than a day
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    // Default to formatted date/time
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Sincronização de Dados</CardTitle>
            <CardDescription>
              Controle a sincronização de dados com a API da Kommo
            </CardDescription>
          </div>
          <Button 
            onClick={handleSync} 
            disabled={syncInProgress || isStatusLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
            {syncInProgress ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Status da Última Sincronização</h3>
            
            {isStatusLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-800/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-neutral-400">Usuários/Corretores</p>
                      <p className="text-sm font-medium mt-1">
                        {syncStatus ? formatSyncTime(syncStatus.users) : 'Nunca'}
                      </p>
                    </div>
                    <div className="p-1.5 bg-primary-800 rounded-full">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-800/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-neutral-400">Leads</p>
                      <p className="text-sm font-medium mt-1">
                        {syncStatus ? formatSyncTime(syncStatus.leads) : 'Nunca'}
                      </p>
                    </div>
                    <div className="p-1.5 bg-primary-800 rounded-full">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-800/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-neutral-400">Atividades</p>
                      <p className="text-sm font-medium mt-1">
                        {syncStatus ? formatSyncTime(syncStatus.activities) : 'Nunca'}
                      </p>
                    </div>
                    <div className="p-1.5 bg-primary-800 rounded-full">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-primary-800/50 p-4 rounded-lg">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-primary-400 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Sincronização Automática</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Os dados são sincronizados automaticamente a cada 5 minutos. Você pode forçar uma sincronização 
                  manual usando o botão acima.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-800/50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-400 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Dados Sincronizados</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  A sincronização traz dados de usuários, leads e atividades da API da Kommo e recalcula 
                  automaticamente os pontos de cada corretor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
