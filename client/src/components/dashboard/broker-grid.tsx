import React from 'react';
import { BrokerCard } from '@/components/broker-card';
import { BrokerPoint } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface BrokerGridProps {
  brokers: BrokerPoint[];
  loading: boolean;
}

export default function BrokerGrid({ brokers, loading }: BrokerGridProps) {
  const placeholderCount = 6;

  // Show loading skeletons while data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array(placeholderCount).fill(0).map((_, index) => (
          <div key={index} className="bg-primary-800 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-primary-700/50 rounded p-2">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-7 w-8 mt-1" />
                  </div>
                ))}
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-4" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
            <div className="bg-primary-700 px-4 py-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-32" />
                <div className="flex space-x-1">
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // When data is loaded but empty
  if (!brokers || brokers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-primary-800/50 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">Nenhum corretor encontrado</h3>
        <p className="max-w-md text-neutral-400 text-sm">
          Não encontramos dados de corretores. Verifique a conexão com a API da Kommo ou aguarde a próxima sincronização.
        </p>
      </div>
    );
  }

  // Sort brokers by performance points in descending order
  const sortedBrokers = [...brokers].sort((a, b) => b.pontos - a.pontos);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedBrokers.map((broker) => (
        <BrokerCard 
          key={broker.id} 
          broker={{
            id: broker.id,
            nome: broker.nome,
            avatar_url: undefined, // We don't have this from the database
            pontos: broker.pontos,
            nivel_desempenho: broker.nivel_desempenho,
            leads_respondidos_1h: broker.leads_respondidos_1h,
            leads_visitados: broker.leads_visitados,
            propostas_enviadas: broker.propostas_enviadas,
            vendas_realizadas: broker.vendas_realizadas,
            leads_atuais: 0, // This would be calculated or retrieved from the API
            updated_at: broker.updated_at,
            resposta_rapida_3h: broker.resposta_rapida_3h,
            leads_sem_interacao_24h: broker.leads_sem_interacao_24h
          }}
        />
      ))}
    </div>
  );
}
