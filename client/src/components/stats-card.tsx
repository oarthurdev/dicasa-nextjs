import React from 'react';
import { cn, calculatePercentageChange } from '@/lib/utils';
import { ArrowUp, ArrowDown, Users, FileText, Calendar, DollarSign } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  previousValue: number;
  icon: 'leads' | 'propostas' | 'visitas' | 'vendas';
}

const iconComponents = {
  leads: Users,
  propostas: FileText,
  visitas: Calendar,
  vendas: DollarSign
};

export function StatsCard({ title, value, previousValue, icon }: StatsCardProps) {
  const percentChange = calculatePercentageChange(value, previousValue);
  const isPositive = percentChange >= 0;
  const IconComponent = iconComponents[icon];
  
  return (
    <div className="bg-primary-800 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-neutral-300 text-sm">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        </div>
        <div className="bg-primary-700 p-2 rounded-lg">
          <IconComponent className="h-5 w-5 text-primary-200" />
        </div>
      </div>
      <div className="flex items-center mt-2">
        <span className={cn(
          "text-sm flex items-center",
          isPositive ? "text-success-500" : "text-danger-500"
        )}>
          {isPositive ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(percentChange)}%
        </span>
        <span className="text-xs text-neutral-400 ml-2">vs. semana anterior</span>
      </div>
    </div>
  );
}
