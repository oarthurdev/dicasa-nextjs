import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { Home, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date: "18 de Abril, 2024"
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('pt-BR', options));
      
      // Format time: "14:35"
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      setCurrentTime(now.toLocaleTimeString('pt-BR', timeOptions));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <header className="bg-primary-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary-500" />
              <h1 className="text-xl font-semibold tracking-wider hidden sm:block">
                IMOBILIÁRIA KPI DASHBOARD
              </h1>
            </a>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-neutral-200 hidden sm:block">
            <span>{currentDate}</span>
            <span className="ml-2">{currentTime}</span>
          </div>
          <div className="flex items-center bg-primary-800 rounded-full py-1 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-100 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{user.cargo === 'administrador' ? 'Admin' : 'Corretor'}</span>
          </div>
          
          {isAdmin() && location !== '/admin' && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
          
          {isAdmin() && location === '/admin' && (
            <Link href="/">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            className="text-sm bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded transition-colors"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
