import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import RecoverPasswordPage from "@/pages/recover-password";
import EmailVerificationPage from "@/pages/email-verification";
import AILibraryPage from "@/pages/ai-library";
import ChatPage from "@/pages/chat-page";
import SubscriptionPage from "@/pages/subscription-page";
import PartnersPage from "@/pages/partners-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/recover-password" component={RecoverPasswordPage} />
      <Route path="/email-verification" component={EmailVerificationPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={AILibraryPage} />
      <ProtectedRoute path="/chat/:listId" component={ChatPage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/partners" component={PartnersPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
