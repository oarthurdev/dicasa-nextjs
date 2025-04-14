import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeatmapData } from '@shared/types';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  data: HeatmapData[];
  loading?: boolean;
  className?: string;
}

export function Heatmap({ data, loading = false, className }: HeatmapProps) {
  // Organize data by day and time block
  const heatmapMatrix = useMemo(() => {
    if (!data || !data.length) {
      return null;
    }

    // Define the correct order for days and time blocks
    const daysOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const timeOrder = ['08h - 10h', '10h - 12h', '12h - 14h', '14h - 16h', '16h - 18h', 'Pós 18h'];

    // Create a matrix with all days and time blocks
    const matrix: Record<string, Record<string, number>> = {};

    // Initialize with 0 counts
    daysOrder.forEach(day => {
      matrix[day] = {};
      timeOrder.forEach(time => {
        matrix[day][time] = 0;
      });
    });

    // Fill in actual data
    data.forEach(item => {
      if (matrix[item.dayOfWeek] && timeOrder.includes(item.timeBlock)) {
        matrix[item.dayOfWeek][item.timeBlock] = item.count;
      }
    });

    // Find max count for color intensity
    let maxCount = 0;
    daysOrder.forEach(day => {
      timeOrder.forEach(time => {
        maxCount = Math.max(maxCount, matrix[day][time]);
      });
    });

    return { matrix, daysOrder, timeOrder, maxCount };
  }, [data]);

  // Identify opportunities and patterns
  const insights = useMemo(() => {
    if (!heatmapMatrix) return [];

    const { matrix, daysOrder, timeOrder, maxCount } = heatmapMatrix;
    const insights = [];

    // Find peak activity time
    let peakDay = '';
    let peakTime = '';
    let peakCount = 0;

    // Find low activity during business hours
    let lowDay = '';
    let lowTime = '';
    let lowCount = maxCount;

    daysOrder.forEach(day => {
      if (day === 'Domingo') return; // Skip Sunday for analysis

      timeOrder.forEach(time => {
        if (time === 'Pós 18h') return; // Skip after-hours for opportunity analysis

        const count = matrix[day][time];

        // Update peak
        if (count > peakCount) {
          peakDay = day;
          peakTime = time;
          peakCount = count;
        }

        // Update low (only for weekdays and business hours)
        if (count < lowCount && day !== 'Sábado') {
          lowDay = day;
          lowTime = time;
          lowCount = count;
        }
      });
    });

    // Check for after-hours activity
    let afterHoursTotal = 0;
    let totalActivity = 0;

    daysOrder.forEach(day => {
      timeOrder.forEach(time => {
        const count = matrix[day][time];
        totalActivity += count;

        if (time === 'Pós 18h') {
          afterHoursTotal += count;
        }
      });
    });

    const afterHoursPercentage = totalActivity > 0 ? 
      Math.round((afterHoursTotal / totalActivity) * 100) : 0;

    // Add insights
    if (peakDay && peakTime) {
      insights.push({
        type: 'peak',
        message: `Alta atividade: ${peakDay} (${peakTime})`,
      });
    }

    if (lowDay && lowTime && lowCount === 0) {
      insights.push({
        type: 'opportunity',
        message: `Oportunidade de Melhoria: ${lowDay} (${lowTime})`,
      });
    }

    if (afterHoursPercentage > 30) {
      insights.push({
        type: 'alert',
        message: `Alerta: ${afterHoursPercentage}% das atividades ocorrem após o horário comercial`,
      });
    }

    return insights;
  }, [heatmapMatrix]);

  // Get color intensity based on count
  function getColorIntensity(count: number, maxCount: number) {
    if (maxCount === 0) return 'bg-primary-800/30';
    
    const intensity = Math.min(0.9, Math.max(0.1, count / maxCount));
    
    return `bg-primary-500/[${intensity.toFixed(2)}]`;
  }

  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
          <CardTitle className="text-sm font-medium">Mapa de Calor - Atividades</CardTitle>
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

  if (!heatmapMatrix) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
          <CardTitle className="text-sm font-medium">Mapa de Calor - Atividades</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-56">
            <div className="text-center text-neutral-400">
              <p>Nenhum dado disponível</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { matrix, daysOrder, timeOrder, maxCount } = heatmapMatrix;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Mapa de Calor - Atividades</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-xs text-neutral-400 font-normal text-left pr-2">Horário/Dia</th>
                {daysOrder.map(day => (
                  <th key={day} className="text-xs text-neutral-400 font-normal text-center px-1">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeOrder.map(time => (
                <tr key={time}>
                  <td className="text-xs text-neutral-400 font-normal text-left py-1 pr-2">{time}</td>
                  {daysOrder.map(day => {
                    const count = matrix[day][time];
                    return (
                      <td key={`${day}-${time}`} className="p-1">
                        <div 
                          className={cn(
                            "w-full h-8 rounded flex items-center justify-center", 
                            getColorIntensity(count, maxCount)
                          )}
                          title={`${day} ${time}: ${count} atividades`}
                        >
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {insights.length > 0 && (
          <div className="mt-4 space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">
                  {insight.type === 'opportunity' ? 'Oportunidade:' :
                   insight.type === 'alert' ? 'Alerta:' : 'Destaque:'}
                </span>
                <span 
                  className={cn(
                    "font-medium",
                    insight.type === 'opportunity' ? "text-warning-500" :
                    insight.type === 'alert' ? "text-danger-500" : "text-success-500"
                  )}
                >
                  {insight.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
