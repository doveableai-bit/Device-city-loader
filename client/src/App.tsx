import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminMenuBar } from "@/components/AdminMenuBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RegionSelector } from "@/components/RegionSelector";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AdminAds from "@/pages/AdminAds";
import AdminLinks from "@/pages/AdminLinks";
import AdminLogin from "@/pages/AdminLogin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <ProtectedRoute>
          <AdminLinks />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/ads">
        <ProtectedRoute>
          <AdminAds />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/links">
        <ProtectedRoute>
          <AdminLinks />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminMenuBar />
        <div className="p-4">
          <RegionSelector />
        </div>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
