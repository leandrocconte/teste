import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const recoverSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function RecoverPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof recoverSchema>>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof recoverSchema>) => {
    setIsLoading(true);
    setMessage("");
    
    try {
      const res = await apiRequest("POST", "/api/reset-password-request", { email: values.email });
      const data = await res.json();
      
      setSuccess(true);
      setMessage(data.message);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para recuperar sua senha.",
      });
    } catch (error) {
      setSuccess(false);
      setMessage("Erro ao enviar email de recuperação. Tente novamente.");
      toast({
        title: "Erro",
        description: "Falha ao enviar email de recuperação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Recuperar senha</h2>
              <p className="text-muted-foreground mt-2">
                Enviaremos um link para seu email
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {message && (
                  <div className={`text-sm p-3 rounded ${
                    success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {message}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate("/auth")}
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
