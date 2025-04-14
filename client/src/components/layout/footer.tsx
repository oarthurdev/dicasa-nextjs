import React from 'react';
import { Home } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const currentTime = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  return (
    <footer className="bg-primary-900 mt-8 py-4 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-primary-500 mr-2" />
            <span className="text-neutral-400 text-sm">© {currentYear} Imobiliária Dashboard</span>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <span className="text-xs text-neutral-500">
              Última atualização: {currentDate} - {currentTime}
            </span>
            <span className="text-xs text-primary-500">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
