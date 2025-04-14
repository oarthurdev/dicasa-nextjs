import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { loginUser, logoutUser, verifyToken } from "@/lib/api";
import { AuthUser } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const authUser = await verifyToken();
        setUser(authUser);
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        const { user } = await loginUser(username, password);
        setUser(user);
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${user.nome}!`,
        });
        setTimeout(() => setLocation("/dashboard"), 100);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        toast({
          title: "Erro de autenticação",
          description: "Usuário ou senha inválidos",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLocation, toast],
  );

  // Logout function
  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    setLocation("/login");
  }, [setLocation, toast]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.cargo === "administrador";
  }, [user]);

  return { user, loading, login, logout, isAdmin };
}
