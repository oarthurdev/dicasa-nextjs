import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ScoringRules from '@/components/admin/scoring-rules';
import SyncControl from '@/components/admin/sync-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, LineChart, Database } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('scoring');

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex flex-col bg-primary-900 text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-lg text-center p-6 bg-primary-800 rounded-lg shadow-lg">
            <Shield className="h-12 w-12 text-primary-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="mb-4">
              Você não tem permissão para acessar a área administrativa. 
              Apenas usuários com o cargo de Administrador podem acessar esta página.
            </p>
            <button
              onClick={() => setLocation('/')}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded transition-colors"
            >
              Voltar para o Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-900 text-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        </div>

        <Tabs defaultValue="scoring" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="border-b border-primary-800">
            <TabsList className="bg-transparent">
              <TabsTrigger value="scoring" className="data-[state=active]:bg-primary-800">
                <LineChart className="h-4 w-4 mr-2" />
                Regras de Pontuação
              </TabsTrigger>
              <TabsTrigger value="sync" className="data-[state=active]:bg-primary-800">
                <Database className="h-4 w-4 mr-2" />
                Sincronização
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary-800">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="scoring" className="space-y-4">
            <ScoringRules />
          </TabsContent>
          
          <TabsContent value="sync" className="space-y-4">
            <SyncControl />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="bg-primary-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Gerenciamento de Usuários</h2>
              <p>
                Os usuários são sincronizados automaticamente com a API da Kommo.
                As senhas padrão são definidas no momento da sincronização.
              </p>
              <div className="mt-4 p-4 bg-primary-700/50 rounded">
                <p className="text-sm text-neutral-300">
                  Nota: Para alterar permissões de usuários, utilize o painel de administração da Kommo.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
