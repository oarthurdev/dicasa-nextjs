import React, { useState, useEffect } from 'react';
import BrokerGrid from '@/components/dashboard/broker-grid';
import { StatsCard } from '@/components/stats-card';
import { Heatmap } from '@/components/ui/heatmap';
import { ConversionFunnel } from '@/components/ui/conversion-funnel';
import FeaturedProperties from '@/components/dashboard/featured-properties';
import { useDashboardData } from '@/hooks/use-broker-data';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Clock, BarChart2, RefreshCw } from 'lucide-react';

// TV Dashboard component com layout de 3 colunas
export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshCount, setRefreshCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { 
    dashboardStats, 
    brokers, 
    heatmapData, 
    conversionFunnel, 
    featuredProperties, 
    refreshAllData, 
    isLoading 
  } = useDashboardData();

  // Atualizar o relógio a cada minuto
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000); // atualiza a cada minuto
    
    return () => clearInterval(clockInterval);
  }, []);

  // Auto-refresh para display de TV a cada 5 minutos
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshAllData();
      setRefreshCount(prev => prev + 1);
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [refreshAllData]);

  // Exibir tela de login se usuário não estiver autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-900">
        <div className="text-center">
          <p className="text-lg text-white mb-4">Você precisa fazer login para acessar o dashboard</p>
          <button 
            onClick={() => setLocation('/login')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Formatar a data atual
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentTime);

  // Formatar a hora atual
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentTime);

  // Ordenar corretores por pontuação
  const sortedBrokers = brokers.data ? [...brokers.data].sort((a, b) => b.pontos - a.pontos) : [];
  
  // Dividir os corretores em 3 colunas para o layout de TV
  const brokersCol1 = sortedBrokers.filter((_, i) => i % 3 === 0);
  const brokersCol2 = sortedBrokers.filter((_, i) => i % 3 === 1);
  const brokersCol3 = sortedBrokers.filter((_, i) => i % 3 === 2);

  return (
    <div className="bg-primary-900 text-white min-h-screen flex flex-col">
      {/* Header com data, hora e estatísticas */}
      <header className="bg-gradient-to-r from-primary-950 to-primary-900 py-3 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-6 w-6 text-primary-400" />
            <h1 className="text-xl font-bold">Dashboard de Performance - Imobiliária</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary-400" />
              <div>
                <div className="text-sm text-primary-300">{formattedDate}</div>
                <div className="text-lg font-bold">{formattedTime}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-primary-300">
              <RefreshCw className="h-4 w-4" />
              <span>Atualizado: {refreshCount} vezes</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Estatísticas gerais */}
      <div className="bg-primary-800 py-3 px-6 border-b border-primary-700">
        <div className="grid grid-cols-4 gap-4">
          <StatsCard 
            title="Leads Ativos" 
            value={dashboardStats.data?.leadsAtivos || 0} 
            previousValue={dashboardStats.data?.weeklyComparison?.leadsAtivos || 0} 
            icon="leads" 
          />
          <StatsCard 
            title="Propostas" 
            value={dashboardStats.data?.propostas || 0} 
            previousValue={dashboardStats.data?.weeklyComparison?.propostas || 0} 
            icon="propostas" 
          />
          <StatsCard 
            title="Visitas" 
            value={dashboardStats.data?.visitas || 0} 
            previousValue={dashboardStats.data?.weeklyComparison?.visitas || 0} 
            icon="visitas" 
          />
          <StatsCard 
            title="Vendas" 
            value={dashboardStats.data?.vendas || 0} 
            previousValue={dashboardStats.data?.weeklyComparison?.vendas || 0} 
            icon="vendas" 
          />
        </div>
      </div>
      
      {/* Layout principal de 3 colunas */}
      <main className="flex-1 p-6 grid grid-cols-3 gap-6">
        {/* Coluna 1 - Corretores */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-primary-700 pb-2 flex items-center">
            <div className="w-2 h-6 bg-green-500 mr-2 rounded-sm"></div>
            Top Corretores
          </h2>
          
          <div className="space-y-4">
            {brokersCol1.map(broker => (
              <div key={broker.id} className="broker-card-container">
                <BrokerCard broker={{
                  id: broker.id,
                  nome: broker.nome,
                  avatar_url: undefined,
                  pontos: broker.pontos,
                  nivel_desempenho: broker.nivel_desempenho,
                  leads_respondidos_1h: broker.leads_respondidos_1h,
                  leads_visitados: broker.leads_visitados,
                  propostas_enviadas: broker.propostas_enviadas,
                  vendas_realizadas: broker.vendas_realizadas,
                  leads_atuais: broker.leads_atuais || 0,
                  updated_at: broker.updated_at,
                  resposta_rapida_3h: broker.resposta_rapida_3h,
                  leads_sem_interacao_24h: broker.leads_sem_interacao_24h
                }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Coluna 2 - Corretores */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-primary-700 pb-2 flex items-center">
            <div className="w-2 h-6 bg-yellow-500 mr-2 rounded-sm"></div>
            Desempenho Médio
          </h2>
          
          <div className="space-y-4">
            {brokersCol2.map(broker => (
              <div key={broker.id} className="broker-card-container">
                <BrokerCard broker={{
                  id: broker.id,
                  nome: broker.nome,
                  avatar_url: undefined,
                  pontos: broker.pontos,
                  nivel_desempenho: broker.nivel_desempenho,
                  leads_respondidos_1h: broker.leads_respondidos_1h,
                  leads_visitados: broker.leads_visitados,
                  propostas_enviadas: broker.propostas_enviadas,
                  vendas_realizadas: broker.vendas_realizadas,
                  leads_atuais: broker.leads_atuais || 0,
                  updated_at: broker.updated_at,
                  resposta_rapida_3h: broker.resposta_rapida_3h,
                  leads_sem_interacao_24h: broker.leads_sem_interacao_24h
                }} />
              </div>
            ))}
          </div>
          
          {/* Heatmap abaixo dos cards dessa coluna */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold border-b border-primary-700 pb-2 mb-3">
              Mapa de Calor de Atividades
            </h2>
            <Heatmap 
              data={heatmapData.data || []} 
              loading={heatmapData.isLoading}
            />
          </div>
        </div>
        
        {/* Coluna 3 - Corretores + Gráficos */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-primary-700 pb-2 flex items-center">
            <div className="w-2 h-6 bg-red-500 mr-2 rounded-sm"></div>
            Precisa Melhorar
          </h2>
          
          <div className="space-y-4">
            {brokersCol3.map(broker => (
              <div key={broker.id} className="broker-card-container">
                <BrokerCard broker={{
                  id: broker.id,
                  nome: broker.nome,
                  avatar_url: undefined,
                  pontos: broker.pontos,
                  nivel_desempenho: broker.nivel_desempenho,
                  leads_respondidos_1h: broker.leads_respondidos_1h,
                  leads_visitados: broker.leads_visitados,
                  propostas_enviadas: broker.propostas_enviadas,
                  vendas_realizadas: broker.vendas_realizadas,
                  leads_atuais: broker.leads_atuais || 0,
                  updated_at: broker.updated_at,
                  resposta_rapida_3h: broker.resposta_rapida_3h,
                  leads_sem_interacao_24h: broker.leads_sem_interacao_24h
                }} />
              </div>
            ))}
          </div>
          
          {/* Conversion Funnel abaixo dos cards dessa coluna */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold border-b border-primary-700 pb-2 mb-3">
              Funil de Conversão
            </h2>
            <ConversionFunnel 
              data={conversionFunnel.data || []} 
              loading={conversionFunnel.isLoading}
            />
          </div>
          
          {/* Featured Properties */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold border-b border-primary-700 pb-2 mb-3">
              Imóveis em Destaque
            </h2>
            <FeaturedProperties 
              properties={featuredProperties.data || []} 
              loading={featuredProperties.isLoading}
            />
          </div>
        </div>
      </main>
      
      {/* Footer simples */}
      <footer className="bg-primary-950 py-2 px-6 text-center text-primary-500 text-sm">
        Dashboard atualizado automaticamente a cada 5 minutos • Última atualização: {new Date().toLocaleTimeString('pt-BR')}
      </footer>
    </div>
  );
}

// Componente BrokerCard embutido para evitar problemas de importação
function BrokerCard({ broker }) {
  const getPerformanceLevel = (points) => {
    if (points >= 50) return "alto";
    if (points >= 20) return "medio";
    return "baixo";
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case "alto": return "bg-green-500 text-white";
      case "medio": return "bg-yellow-500 text-white";
      case "baixo": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const performanceLevel = broker.nivel_desempenho || getPerformanceLevel(broker.pontos);
  const performanceColorClass = getPerformanceColor(performanceLevel);
  
  // Calcula progresso percentual para a barra de leads
  const progressPercentage = Math.min(100, Math.max(0, broker.pontos));
  
  // Determina badges de qualidade de resposta
  const showFastResponse = broker.resposta_rapida_3h && broker.resposta_rapida_3h > 0;
  const showDelayedResponse = broker.leads_sem_interacao_24h && broker.leads_sem_interacao_24h > 3;
  
  return (
    <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-lg shadow-lg overflow-hidden transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex space-x-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${performanceColorClass}`}>
              {broker.nome.substring(0, 1)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{broker.nome}</h3>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${performanceColorClass}`}>
                  {performanceLevel === "alto" ? "Alto" : performanceLevel === "medio" ? "Médio" : "Baixo"}
                </span>
              </div>
            </div>
          </div>
          <div className={`text-white text-xl font-bold rounded-full h-10 w-10 flex items-center justify-center ${performanceColorClass}`}>
            {broker.pontos}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-primary-700/50 rounded p-2">
            <div className="flex items-center text-primary-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-xs font-medium">Leads 1h</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.leads_respondidos_1h}</p>
          </div>
          
          <div className="bg-primary-700/50 rounded p-2">
            <div className="flex items-center text-primary-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium">Visitas</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.leads_visitados}</p>
          </div>
          
          <div className="bg-primary-700/50 rounded p-2">
            <div className="flex items-center text-primary-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium">Propostas</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.propostas_enviadas}</p>
          </div>
          
          <div className="bg-primary-700/50 rounded p-2">
            <div className="flex items-center text-primary-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">Vendas</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.vendas_realizadas}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-neutral-300 mb-1">
            <span>Leads Atuais</span>
            <span>{broker.leads_atuais || 0}</span>
          </div>
          <div className="w-full bg-primary-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${performanceColorClass}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Badges de status */}
      <div className="bg-primary-700 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-neutral-300 truncate">
          Última atividade: {new Date(broker.updated_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <div className="flex space-x-1">
          {showFastResponse && (
            <div className="bg-green-500/10 text-green-500 text-xs px-2 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rápida
            </div>
          )}
          
          {showDelayedResponse && (
            <div className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Lenta
            </div>
          )}
          
          {broker.leads_sem_interacao_24h > 0 && (
            <div className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              +24h
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
