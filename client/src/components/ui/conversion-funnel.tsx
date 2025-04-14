import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConversionFunnelData } from '@shared/types';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ConversionFunnelProps {
  data: ConversionFunnelData[];
  loading?: boolean;
  className?: string;
}

export function ConversionFunnel({ data, loading = false, className }: ConversionFunnelProps) {
  // Calculate conversion rates between funnel stages
  const conversionRates = React.useMemo(() => {
    if (!data || data.length < 2) return [];

    const rates = [];
    const stages = ['Contato Inicial', 'Visita', 'Proposta', 'Venda'];
    
    // Find the counts for each stage, defaulting to 0 if not found
    const stageCounts = stages.map(
      stage => data.find(item => item.stage === stage)?.count || 0
    );

    // Calculate rates between stages
    for (let i = 0; i < stages.length - 1; i++) {
      const fromCount = stageCounts[i];
      const toCount = stageCounts[i + 1];
      const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;
      
      rates.push({
        from: stages[i],
        to: stages[i + 1],
        rate,
        // Mock trend direction for demonstration
        trend: Math.random() > 0.5 ? 'up' : 'down'
      });
    }

    // Add overall conversion rate
    const firstCount = stageCounts[0];
    const lastCount = stageCounts[stageCounts.length - 1];
    
    rates.push({
      from: 'Contato Inicial',
      to: 'Venda',
      rate: firstCount > 0 ? Math.round((lastCount / firstCount) * 100) : 0,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      isOverall: true
    });

    return rates;
  }, [data]);

  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
          <CardTitle className="text-sm font-medium">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-56">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-primary-600/20 rounded-full mb-2"></div>
              <div className="h-4 w-40 bg-primary-600/20 rounded mb-1"></div>
              <div className="h-4 w-32 bg-primary-600/20 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Funil de Conversão</CardTitle>
          <div className="flex space-x-1">
            <button className="text-xs bg-primary-700 hover:bg-primary-600 px-2 py-0.5 rounded transition-colors">
              7 dias
            </button>
            <button className="text-xs bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded transition-colors">
              30 dias
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Funnel Chart */}
        <div className="w-full h-56 flex flex-col items-center justify-center">
          {data.map((item, index) => {
            // Calculate width percentage, ensuring the funnel gets narrower
            const widthPercentage = 100 - (index * (70 / data.length));
            
            // Pick color based on stage
            const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8E44AD'];
            const bgColor = colors[index % colors.length];
            
            return (
              <div 
                key={item.stage}
                className="w-full flex flex-col items-center"
                style={{ height: `${100 / data.length}%` }}
              >
                <div 
                  className="rounded-md text-white flex items-center justify-center text-sm font-medium p-2 transition-all"
                  style={{ 
                    width: `${widthPercentage}%`,
                    backgroundColor: bgColor
                  }}
                >
                  {item.stage} ({item.count})
                </div>
                {index < data.length - 1 && (
                  <div className="h-2 w-0.5 bg-neutral-700"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Conversion Rates */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {conversionRates.map((rate, index) => (
            <div 
              key={index} 
              className={cn(
                "bg-primary-700/30 p-3 rounded",
                rate.isOverall && "col-span-2"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        index === 0 ? "bg-primary-500" : 
                        index === 1 ? "bg-warning-500" : 
                        index === 2 ? "bg-success-500" : 
                        "bg-danger-500"
                      )}
                    ></div>
                    <span className="text-xs text-neutral-300">
                      {rate.from} → {rate.to}
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-1">{rate.rate}%</p>
                </div>
                <div className={cn(
                  rate.trend === 'up' ? "text-primary-500" : "text-danger-500"
                )}>
                  {rate.trend === 'up' ? (
                    <ArrowUp className="h-5 w-5" />
                  ) : (
                    <ArrowDown className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
