import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyCard } from '@/components/property-card';
import { PropertyData } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedPropertiesProps {
  properties: PropertyData[];
  loading: boolean;
}

export default function FeaturedProperties({ properties, loading }: FeaturedPropertiesProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Imóveis em Destaque</CardTitle>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex items-center p-2 rounded">
                <Skeleton className="w-16 h-12 rounded" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no properties are available
  if (!properties || properties.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Imóveis em Destaque</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm text-neutral-400">
              Nenhum imóvel em destaque disponível
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary-900 border-b border-primary-700 py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Imóveis em Destaque</CardTitle>
          <button className="text-xs bg-primary-700 hover:bg-primary-600 px-2 py-1 rounded transition-colors">
            Ver Todos
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
