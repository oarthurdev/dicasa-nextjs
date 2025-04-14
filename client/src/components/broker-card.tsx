import React from 'react';
import { cn, formatDateTime, getPerformanceLevel, getPerformanceColor, getPerformanceLabel } from '@/lib/utils';
import { BrokerCardProps } from '@shared/types';
import { BellRing, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function BrokerCard({ broker }: BrokerCardProps) {
  const performanceLevel = broker.nivel_desempenho || getPerformanceLevel(broker.pontos);
  const performanceColor = getPerformanceColor(performanceLevel);
  
  // Calculate progress percentage for the leads bar
  const progressPercentage = Math.min(100, Math.max(0, broker.pontos));
  
  // Determine response quality badge
  const showFastResponse = broker.resposta_rapida_3h && broker.resposta_rapida_3h > 0;
  const showDelayedResponse = broker.leads_sem_interacao_24h && broker.leads_sem_interacao_24h > 3;
  
  return (
    <div className={cn(
      "broker-card bg-gradient-to-br from-primary-800 to-primary-900 rounded-lg shadow-lg overflow-hidden transition-all",
      "hover:translate-y-[-2px] hover:shadow-xl"
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex space-x-3">
            {broker.avatar_url ? (
              <img
                src={broker.avatar_url}
                alt={broker.nome}
                className={cn(
                  "h-12 w-12 rounded-full object-cover border-2",
                  `border-${performanceColor}-500`
                )}
              />
            ) : (
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold",
                `bg-${performanceColor}-500`
              )}>
                {broker.nome.substring(0, 1)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white">{broker.nome}</h3>
              <div className="flex items-center mt-1">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white",
                  `bg-${performanceColor}-500`
                )}>
                  {getPerformanceLabel(performanceLevel)}
                </span>
              </div>
            </div>
          </div>
          <div className={cn(
            "text-white text-xl font-bold rounded-full h-10 w-10 flex items-center justify-center",
            `bg-${performanceColor}-500`
          )}>
            {broker.pontos}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-primary-700/50 rounded p-2">
            <div className={cn(
              "flex items-center",
              `text-${performanceColor}-500`
            )}>
              <BellRing className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Leads 1h</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.leads_respondidos_1h}</p>
          </div>
          
          <div className="bg-primary-700/50 rounded p-2">
            <div className={cn(
              "flex items-center",
              `text-${performanceColor}-500`
            )}>
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Visitas</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.leads_visitados}</p>
          </div>
          
          <div className="bg-primary-700/50 rounded p-2">
            <div className={cn(
              "flex items-center",
              `text-${performanceColor}-500`
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium">Propostas</span>
            </div>
            <p className="text-white text-xl font-semibold mt-1">{broker.propostas_enviadas}</p>
          </div>
          
          <div className="bg-primary-700/50 rounded p-2">
            <div className={cn(
              "flex items-center",
              `text-${performanceColor}-500`
            )}>
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
              className={cn(
                "h-2 rounded-full",
                `bg-${performanceColor}-500`
              )}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="bg-primary-700 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-neutral-300">
          Atualizado: {formatDateTime(broker.updated_at)}
        </span>
        <div className="flex space-x-1">
          {showFastResponse && (
            <div className={cn(
              "bg-success-500/10 text-success-500 text-xs px-2 py-0.5 rounded-full flex items-center"
            )}>
              <CheckCircle className="h-3 w-3 mr-0.5" />
              Rápida
            </div>
          )}
          
          {showDelayedResponse && (
            <div className="bg-danger-500/10 text-danger-500 text-xs px-2 py-0.5 rounded-full flex items-center">
              <AlertTriangle className="h-3 w-3 mr-0.5" />
              Lenta
            </div>
          )}
          
          {broker.leads_sem_interacao_24h > 0 && (
            <div className="bg-danger-500/10 text-danger-500 text-xs px-2 py-0.5 rounded-full flex items-center">
              <Clock className="h-3 w-3 mr-0.5" />
              +24h
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
