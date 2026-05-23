import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChaosProvider } from "@/lib/ChaosContext";
import { Navbar } from "@/components/Navbar";

// Pages
import Landing from "@/pages/Landing";
import Translate from "@/pages/Translate";
import History from "@/pages/History";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/translate" component={Translate} />
          <Route path="/history" component={History} />
          <Route path="/favorites" component={Favorites} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChaosProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ChaosProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
