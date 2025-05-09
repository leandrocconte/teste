import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmailVerificationPage() {
  const [_, navigate] = useLocation();
  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Extract email from query params
    const params = new URLSearchParams(location.split("?")[1]);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);
  
  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      // Mock API call for resending verification
      // In a real app, this would call a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email reenviado",
        description: "Verifique sua caixa de entrada para o novo link.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao reenviar email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full mx-auto flex items-center justify-center mb-4">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Verifique seu email</h2>
              <p className="text-muted-foreground mt-2">
                Enviamos um link de confirmação para{" "}
                <span className="text-foreground font-medium">
                  {email || "seu email"}
                </span>
              </p>
            </div>
            
            <div className="bg-secondary rounded-lg p-4 mb-6">
              <p className="text-muted-foreground text-sm">
                Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta. 
                Se não encontrar o email, verifique também sua pasta de spam.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleResendVerification} 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                disabled={isResending}
              >
                {isResending ? "Reenviando..." : "Reenviar email de verificação"}
              </Button>
              
              <Button 
                onClick={() => navigate("/auth")} 
                variant="secondary"
                className="w-full"
              >
                Voltar para o login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
