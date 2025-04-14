import * as React from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  nome: string;
  email: string;
  cargo: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/check", {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        setUser(null);
        return false;
      }
      
      const data = await response.json();
      if (data && data.authenticated && data.user) {
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest(
        "POST",
        "/api/auth/login",
        { username, password }
      );
      
      const data = await response.json();
      
      if (data && data.success && data.user) {
        setUser(data.user);
        toast({ 
          message: "Login realizado com sucesso", 
          type: "success" 
        });
        return true;
      } else {
        toast({ 
          message: data?.message || "Falha no login", 
          type: "error" 
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({ 
        message: "Erro ao tentar fazer login", 
        type: "error" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await apiRequest("POST", "/api/auth/logout");
      
      setUser(null);
      navigate("/login");
      toast({ 
        message: "Logout realizado com sucesso", 
        type: "success" 
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({ 
        message: "Erro ao fazer logout", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}