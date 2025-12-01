import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { useUserStore } from "@/lib/userContext";
import { useEffect } from "react";
import Home from "@/pages/Home";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: any }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <Component />;
}

function Router() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/stats" component={Stats} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile" component={Profile} />
        </>
      ) : (
        <Route path="/" component={Login} />
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const token = useUserStore((state) => state.token);

  // Auto-login if token exists
  useEffect(() => {
    if (token && !useUserStore.getState().isAuthenticated) {
      useUserStore.getState().setToken(token);
    }
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
