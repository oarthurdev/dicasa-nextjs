import React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { PropertyData } from '@shared/types';

interface PropertyCardProps {
  property: PropertyData;
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Default placeholder image if none provided
  const imagePlaceholder = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
  
  return (
    <div className="flex items-center bg-primary-700/30 p-2 rounded transition-all hover:bg-primary-700/50">
      <div 
        className="w-16 h-12 rounded bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${property.imagem_url || imagePlaceholder})` 
        }}
      />
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium">{property.titulo}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-300">
            {property.quartos} {property.quartos === 1 ? 'quarto' : 'quartos'} • {property.area}m²
          </span>
          <span className="text-xs font-medium text-success-500">
            {formatCurrency(property.preco)}
          </span>
        </div>
      </div>
    </div>
  );
}
