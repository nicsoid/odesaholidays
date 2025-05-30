import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Creator from "@/pages/creator";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Events from "@/pages/events";
import Locations from "@/pages/locations";
import PostcardView from "@/pages/postcard-view";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/creator" component={Creator} />
        <Route path="/creator/:templateId" component={Creator} />
        <Route path="/checkout/:postcardId" component={Checkout} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/events" component={Events} />
        <Route path="/locations" component={Locations} />
        <Route path="/share/:postcardId" component={PostcardView} />
        <Route path="/gallery" component={Home} />
        <Route path="/pricing" component={Home} />
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
