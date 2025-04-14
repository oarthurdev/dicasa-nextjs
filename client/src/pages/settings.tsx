import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  KeyIcon, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCcw, 
  ArrowDownSquare, 
  Info as InfoIcon, 
  Terminal as TerminalIcon,
  ChevronDown as ChevronDownIcon,
  Clipboard as ClipboardIcon,
  Search as SearchIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [showManualTokenInput, setShowManualTokenInput] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState('');
  const [manualTokenData, setManualTokenData] = useState({
    access_token: '',
    refresh_token: '',
    expires_in: '86400'
  });
  
  // Verificar status de conexão da API Kommo
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/oauth/status');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      setIsConnected(false);
    }
  };
  
  // Iniciar processo de autorização
  const startAuthorization = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/oauth/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
        
        // Abrir popup de autorização
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.authUrl,
          'KommoAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Listener para mensagens do popup
        window.addEventListener('message', function onMessage(event) {
          if (event.data && event.data.type === 'KOMMO_AUTH_SUCCESS') {
            window.removeEventListener('message', onMessage);
            toast({
              title: 'Autenticação concluída',
              description: 'Conexão com a Kommo estabelecida com sucesso!',
            });
            setIsConnected(true);
            if (popup) popup.close();
          }
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar autorização:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o processo de autorização',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Salvar token manualmente
  const saveManualToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/oauth/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualTokenData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Token configurado manualmente com sucesso',
        });
        setIsConnected(true);
        setShowManualTokenInput(false);
        setManualTokenData({
          access_token: '',
          refresh_token: '',
          expires_in: '86400'
        });
      } else {
        toast({
          title: 'Erro',
          description: data.message || 'Não foi possível salvar o token manualmente',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar token manualmente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o token manualmente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);
  
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
            <ShieldCheck className="h-12 w-12 text-primary-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="mb-4">
              Você não tem permissão para acessar a página de configurações. 
              Apenas usuários com o cargo de Administrador podem acessar esta página.
            </p>
            <Button
              onClick={() => setLocation('/')}
              variant="default"
            >
              Voltar para o Dashboard
            </Button>
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
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        </div>
        
        <Tabs defaultValue="integration" className="space-y-6">
          <div className="border-b border-primary-800">
            <TabsList className="bg-transparent">
              <TabsTrigger value="integration" className="data-[state=active]:bg-primary-800">
                <KeyIcon className="h-4 w-4 mr-2" />
                Integração com Kommo
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conexão com a API da Kommo</CardTitle>
                <CardDescription>
                  Configure a integração com a API da Kommo para sincronização de usuários, leads e atividades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected ? (
                  <Alert className="bg-green-800/20 border-green-800">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <AlertTitle>Conectado à Kommo</AlertTitle>
                    <AlertDescription>
                      A aplicação está conectada à API da Kommo e recebendo dados de sincronização.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-amber-800/20 border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertTitle>Não conectado</AlertTitle>
                    <AlertDescription>
                      A aplicação não está conectada à API da Kommo. Clique no botão abaixo para iniciar o processo de autorização.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="bg-primary-800/50 p-4 rounded">
                    <h3 className="text-sm font-medium mb-2">Sobre a integração</h3>
                    <p className="text-sm text-neutral-300">
                      Esta integração permite que a aplicação obtenha dados do Kommo CRM, incluindo usuários (corretores), 
                      leads e atividades. Esses dados são usados para calcular os indicadores de desempenho mostrados no dashboard.
                    </p>
                  </div>
                  
                  <div className="bg-blue-900/30 border border-blue-800/40 p-4 rounded">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <InfoIcon className="h-4 w-4 mr-2 text-blue-400" />
                      Instruções para integração
                    </h3>
                    <div className="text-sm text-neutral-300 space-y-2">
                      <p>
                        Para conectar a aplicação ao Kommo CRM, siga estes passos:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 pl-2">
                        <li>Acesse seu painel de administração no Kommo</li>
                        <li>Vá para Configurações → Integrações → API</li>
                        <li>Adicione uma nova integração com os dados abaixo</li>
                        <li>Após criar a integração, anote as credenciais <code>client_id</code> e <code>client_secret</code></li>
                        <li>Volte aqui e clique em "Conectar ao Kommo"</li>
                      </ol>
                      
                      <div className="mt-3 p-3 bg-primary-950/50 rounded font-mono text-xs">
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                          <div className="text-neutral-400">Nome:</div>
                          <div>Dashboard de Corretores DiCasa</div>
                          
                          <div className="text-neutral-400">Redirect URI:</div>
                          <div className="break-all">{window.location.origin}/api/oauth/callback-page</div>
                          
                          <div className="text-neutral-400">Direitos:</div>
                          <div>CRM (Contatos, Empresas, Leads)</div>
                        </div>
                      </div>
                      
                      <p className="pt-2 text-amber-400">
                        Importante: Esta aplicação requer acesso aos dados do Kommo CRM para funcionar. Sem uma conexão ativa,
                        você não conseguirá visualizar dados de corretores, leads ou atividades.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-800/30 p-4 rounded">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex items-center justify-between w-full p-0 hover:bg-transparent">
                          <span className="flex items-center text-sm font-medium">
                            <TerminalIcon className="h-4 w-4 mr-2 text-green-500" />
                            Depuração e Testes
                          </span>
                          <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="space-y-3 text-xs text-neutral-300">
                          <p>
                            Se você tiver dificuldades com a autenticação da API, é possível testar diretamente 
                            usando as ferramentas abaixo:
                          </p>
                          
                          <div>
                            <h4 className="text-xs font-medium text-green-400 mb-1">1. Endpoint de autorização</h4>
                            <code className="block p-2 rounded bg-primary-950/70 text-xs overflow-x-auto whitespace-pre">
                              https://dicasaindaial.kommo.com/oauth2/access_token
                            </code>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-green-400 mb-1">2. Exemplo de curl para testar:</h4>
                            <code className="block p-2 rounded bg-primary-950/70 text-xs overflow-x-auto whitespace-pre">
{`curl --request POST \\
  --url https://dicasaindaial.kommo.com/oauth2/access_token \\
  --header 'accept: application/json' \\
  --header 'content-type: application/json' \\
  --data '{
    "client_secret": "SEU_CLIENT_SECRET", 
    "client_id": "SEU_CLIENT_ID",
    "grant_type": "authorization_code",
    "code": "CÓDIGO_DE_AUTORIZAÇÃO",
    "redirect_uri": "${window.location.origin}/api/oauth/callback-page"
  }'`}
                            </code>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-green-400 mb-1">3. Diagnóstico da conexão:</h4>
                            <div className="flex mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mr-2"
                                onClick={async () => {
                                  try {
                                    const response = await fetch('/api/oauth/diagnose');
                                    const data = await response.json();
                                    
                                    // Formatar o JSON para exibição
                                    const formattedData = JSON.stringify(data, null, 2);
                                    
                                    // Mostrar em uma caixa de texto para facilitar a cópia
                                    setDiagnosticData(formattedData);
                                    setShowDiagnosticModal(true);
                                  } catch (error) {
                                    toast({
                                      title: 'Erro',
                                      description: 'Erro ao obter diagnóstico da conexão',
                                      variant: 'destructive',
                                    });
                                  }
                                }}
                              >
                                <SearchIcon className="h-3 w-3 mr-1" /> Verificar Estado da Conexão
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    setRefreshingToken(true);
                                    const response = await fetch('/api/oauth/refresh-token', {
                                      method: 'POST',
                                    });
                                    const data = await response.json();
                                    
                                    if (data.success) {
                                      toast({
                                        title: 'Sucesso',
                                        description: 'Token atualizado com sucesso',
                                      });
                                      checkConnectionStatus();
                                    } else {
                                      toast({
                                        title: 'Erro',
                                        description: data.message || 'Erro ao atualizar token',
                                        variant: 'destructive',
                                      });
                                    }
                                  } catch (error) {
                                    toast({
                                      title: 'Erro',
                                      description: 'Erro ao atualizar token',
                                      variant: 'destructive',
                                    });
                                  } finally {
                                    setRefreshingToken(false);
                                  }
                                }}
                                disabled={refreshingToken}
                              >
                                {refreshingToken ? (
                                  <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <RefreshCcw className="h-3 w-3 mr-1" />
                                )}
                                Atualizar Token
                              </Button>
                            </div>
                          </div>
                          
                          <Alert className="bg-blue-900/20 border-blue-800/30">
                            <InfoIcon className="h-4 w-4 text-blue-500" />
                            <AlertDescription className="text-xs">
                              Se você já possui um token válido, use a opção "Configurar Manualmente" abaixo para inserir 
                              os tokens diretamente sem passar pelo fluxo de autorização OAuth.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    {/* Modal de diagnóstico */}
                    {showDiagnosticModal && (
                      <Dialog open={showDiagnosticModal} onOpenChange={setShowDiagnosticModal}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Diagnóstico da Conexão Kommo</DialogTitle>
                            <DialogDescription>
                              Informações detalhadas sobre o estado atual da conexão com a API Kommo
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="flex-1 overflow-auto">
                            <pre className="p-4 bg-primary-950 rounded text-xs text-neutral-300 overflow-auto h-[50vh]">
                              {diagnosticData}
                            </pre>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="secondary" onClick={() => setShowDiagnosticModal(false)}>Fechar</Button>
                            <Button onClick={() => {
                              // Copiar para a área de transferência
                              navigator.clipboard.writeText(diagnosticData);
                              toast({
                                title: 'Copiado',
                                description: 'Informações de diagnóstico copiadas para a área de transferência',
                              });
                            }}>
                              <ClipboardIcon className="h-4 w-4 mr-2" />
                              Copiar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-primary-800/30 px-6 py-4">
                <div className="text-sm text-neutral-400">
                  {isConnected ? 'Última sincronização: Há 5 minutos' : 'Status: Não conectado'}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    onClick={startAuthorization}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : isConnected ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reconectar
                      </>
                    ) : (
                      <>
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Conectar ao Kommo
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setShowManualTokenInput(prev => !prev)}
                  >
                    <ArrowDownSquare className="h-4 w-4 mr-2" />
                    {showManualTokenInput ? "Ocultar" : "Configurar Manualmente"}
                  </Button>
                </div>
                
                {showManualTokenInput && (
                  <div className="mt-4 p-4 bg-primary-800/20 rounded border border-primary-800/40">
                    <h4 className="font-medium text-sm mb-2">Configuração Manual de Token</h4>
                    <p className="text-xs text-neutral-400 mb-4">
                      Use esta opção somente se você já possui um token válido da API Kommo.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="access_token" className="text-xs">Access Token</Label>
                        <Textarea 
                          id="access_token"
                          placeholder="eyJ0eXA..."
                          rows={2}
                          value={manualTokenData.access_token}
                          onChange={(e) => setManualTokenData(prev => ({
                            ...prev,
                            access_token: e.target.value
                          }))}
                        />
                      </div>
                      
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="refresh_token" className="text-xs">Refresh Token</Label>
                        <Textarea 
                          id="refresh_token"
                          placeholder="def502..."
                          rows={2}
                          value={manualTokenData.refresh_token}
                          onChange={(e) => setManualTokenData(prev => ({
                            ...prev,
                            refresh_token: e.target.value
                          }))}
                        />
                      </div>
                      
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="expires_in" className="text-xs">Expires In (segundos)</Label>
                        <Input 
                          id="expires_in"
                          type="number"
                          placeholder="86400"
                          value={manualTokenData.expires_in}
                          onChange={(e) => setManualTokenData(prev => ({
                            ...prev,
                            expires_in: e.target.value
                          }))}
                        />
                      </div>
                      
                      <Button 
                        onClick={saveManualToken}
                        disabled={!manualTokenData.access_token || !manualTokenData.refresh_token || !manualTokenData.expires_in}
                        className="w-full"
                      >
                        Salvar Token Manualmente
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}