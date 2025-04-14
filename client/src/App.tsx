import { Switch, Route, useLocation } from "wouter";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";

function AppRoutes() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect based on authentication status
  useEffect(() => {
    if (!loading) {
      if (!user && location !== "/login") {
        setLocation("/login");
      } else if (user && location === "/login") {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-900">
        <div className="animate-pulse text-primary-100">Carregando...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;
