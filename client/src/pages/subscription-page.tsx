import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { Tier, ChecklistPlano } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SubscriptionPage() {
  const { user } = useAuth();
  
  const { data: tiers, isLoading: tiersLoading } = useQuery<Tier[]>({
    queryKey: ["/api/tiers"],
  });
  
  const { data: checklistItems } = useQuery<ChecklistPlano[]>({
    queryKey: ["/api/checklist-planos"],
  });
  
  // Get user's tier
  const userTier = tiers?.find(tier => tier.tier_id === user?.tier_id);
  
  // Calculate percentage of responses used
  const responsesPercentage = userTier && user 
    ? (user.responses_available / userTier.responses_limit) * 100
    : 0;
  
  const handleSelectPlan = (tierId: number) => {
    // In a real app, this would redirect to a payment page or process
    if (tiers) {
      const tier = tiers.find(t => t.tier_id === tierId);
      if (tier && tier.link) {
        window.open(tier.link, '_blank');
      }
    }
  };
  
  // Format price (e.g., 1690 -> R$ 16,90)
  const formatPrice = (price: number) => {
    if (price === 0) return "Grátis";
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-screen-xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">Gerenciar Assinatura</h1>
                <p className="text-muted-foreground mt-1">
                  Escolha o plano ideal para suas necessidades
                </p>
              </div>
              
              {tiersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Current Plan */}
                  {userTier && (
                    <div className="bg-card border border-border rounded-xl p-5 mb-8">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-muted-foreground text-sm mb-1">Seu plano atual</div>
                          <h3 className="text-xl font-semibold flex items-center">
                            <span>{userTier.titulo}</span>
                            <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-primary bg-opacity-10 text-primary rounded">
                              Ativo
                            </span>
                          </h3>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <div className="text-muted-foreground text-sm mb-1">Respostas disponíveis</div>
                          <div className="flex items-center">
                            <span className="text-2xl font-mono font-medium">{user?.responses_available}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              / <span>{userTier.responses_limit}</span> por mês
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-border">
                        <Progress value={responsesPercentage} className="h-3" />
                        <div className="mt-2 text-xs text-muted-foreground">
                          Próxima recarga em 15 dias
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Available Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {tiers?.map((tier) => (
                      <div
                        key={tier.tier_id}
                        className={`bg-card border rounded-xl overflow-hidden flex flex-col ${
                          user?.tier_id === tier.tier_id
                            ? "border-primary ring-1 ring-primary"
                            : "border-border hover:border-muted"
                        }`}
                      >
                        {/* Plan header */}
                        <div className="p-5 border-b border-border">
                          <div className="text-foreground font-medium mb-1">{tier.titulo}</div>
                          <div className="flex items-baseline mb-4">
                            <span className="text-2xl font-bold">{formatPrice(tier.valor)}</span>
                            {tier.valor > 0 && (
                              <span className="text-muted-foreground ml-1">/mês</span>
                            )}
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <span className="font-medium text-foreground">{tier.responses_limit}</span>
                            <span className="ml-1">mensagens/mês</span>
                          </div>
                        </div>
                        
                        {/* Plan features */}
                        <div className="p-5 flex-1">
                          <ul className="space-y-3 mb-6">
                            {[
                              { id: 1, desc: "Acesso a todos os assistentes", value: tier.check1 },
                              { id: 2, desc: "Histórico de conversas", value: tier.check2 },
                              { id: 3, desc: "Suporte prioritário", value: tier.check3 }
                            ].map((item) => (
                              <li key={item.id} className="flex items-start">
                                <div className="mr-2 mt-0.5">
                                  {item.value === "sim" ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <span
                                  className={`text-sm ${
                                    item.value === "sim"
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {item.desc}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Plan footer */}
                        <div className="p-5 pt-0">
                          <Button
                            className="w-full"
                            variant={user?.tier_id === tier.tier_id ? "secondary" : "default"}
                            disabled={user?.tier_id === tier.tier_id}
                            onClick={() => handleSelectPlan(tier.tier_id)}
                          >
                            {user?.tier_id === tier.tier_id ? "Plano atual" : "Assinar plano"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* FAQ Section */}
                  <div className="bg-card border border-border rounded-xl p-5 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Perguntas frequentes</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Como é feita a cobrança?</AccordionTrigger>
                        <AccordionContent>
                          A cobrança é feita mensalmente através do cartão de crédito cadastrado. Você pode cancelar a qualquer momento.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-2">
                        <AccordionTrigger>O que acontece se eu usar todas as mensagens?</AccordionTrigger>
                        <AccordionContent>
                          Quando todas as mensagens são utilizadas, você precisará esperar o próximo ciclo de faturamento ou fazer um upgrade para um plano com mais mensagens.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Posso mudar de plano a qualquer momento?</AccordionTrigger>
                        <AccordionContent>
                          Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entrarão em vigor no próximo ciclo de faturamento.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
