import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Creator from "@/pages/creator";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/creator" component={Creator} />
        <Route path="/creator/:templateId" component={Creator} />
        <Route path="/checkout/:postcardId" component={Checkout} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
