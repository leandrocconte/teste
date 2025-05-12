import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Menu, Bot, CrownIcon, TicketIcon, LogOut, HelpCircle } from "lucide-react";
import { Tier, ChecklistPlano } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useRef, useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { data: tiers, isLoading: tiersLoading } = useQuery<Tier[]>({
    queryKey: ["/api/tiers"],
  });
  
  const { data: checklistItems } = useQuery<ChecklistPlano[]>({
    queryKey: ["/api/checklist-planos"],
  });
  
  // Get user's tier
  const userTier = Array.isArray(tiers) ? tiers.find((tier: any) => tier.tier_id === user?.tier_id) : undefined;
  
  // Calculate percentage of responses used
  const responsesPercentage = userTier && user 
    ? (user.responses_available / userTier.responses_limit) * 100
    : 0;
    
  // Função para obter a data de renovação de créditos
  const obterDataRenovacao = () => {
    if (!user) return new Date();
    
    const hoje = new Date();
    // Trate os campos como strings para evitar erros de tipagem
    const createdAt = user.created_at ? new Date(String(user.created_at)) : hoje;
    const lastPaymentDate = user.last_payment_date ? new Date(String(user.last_payment_date)) : hoje;
    
    const dataBase = user.tier_id === 4 // 4 = plano free
      ? createdAt // plano free: baseado na data de cadastro
      : lastPaymentDate; // outros planos: baseado na data do último pagamento
      
    // Adiciona 30 dias à data base
    const dataRenovacao = new Date(dataBase);
    dataRenovacao.setDate(dataRenovacao.getDate() + 30);
    
    return dataRenovacao;
  };
  
  // Calcula dias para renovação de créditos
  const calculaDiasParaRenovacao = () => {
    if (!user) return 0;
    
    const hoje = new Date();
    const dataRenovacao = obterDataRenovacao();
    
    // Calcula a diferença em dias
    const diffTime = dataRenovacao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Formata a data no formato brasileiro
  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const navigationItems = [
    { id: "library", title: "Biblioteca de IAs", icon: <Bot size={20} />, path: "/" },
    { id: "subscription", title: "Gerenciar Assinatura", icon: <CrownIcon size={20} />, path: "/subscription" },
    { id: "partners", title: "Descontos com Parceiros", icon: <TicketIcon size={20} />, path: "/partners" },
  ];

  // Handle sidebar location
  const [location] = useLocation();
  
  // Close sidebar when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);
  
  // Logout usando o hook useAuth
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Determine if a nav item is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <span className="font-semibold text-lg">IA Chat</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="p-1 hover:bg-secondary rounded"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Responses Counter */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Respostas disponíveis</span>
          <span className="font-mono px-2 py-1 bg-secondary rounded text-primary">
            {user?.responses_available || 0}
          </span>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center px-3 py-2 rounded-md transition ${
                isActive(item.path)
                  ? "bg-primary text-white"
                  : "hover:bg-secondary"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* User profile and logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserAvatar name={user?.name || ""} />
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
  
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
      {/* Header com hamburger menu */}
      <header className="bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-secondary transition"
        >
          <Menu size={20} />
        </button>
        <div className="text-lg font-medium">Gerenciar Assinatura</div>
        <div className="w-8"></div>
      </header>
      
      {/* Sidebar para mobile e desktop como overlay */}
      <div className={`fixed inset-0 z-50 ${!isSidebarOpen && "hidden"}`}>
        {/* Backdrop para fechar o menu ao clicar fora */}
        <div 
          className="absolute inset-0 bg-background/80" 
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar Content */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border 
                     flex flex-col transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {sidebarContent}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-screen-xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold">Gerenciar Assinatura</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://api.whatsapp.com?phone=5517992695422&text=Preciso de suporte com minha assinatura", "_blank")}
                    className="flex items-center"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-4 h-4 mr-2 text-green-500"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.917 1.04 5.591 2.769 7.671L.524 23.986c-.125.283-.046.615.167.817.212.204.548.248.829.114l4.815-2.308A11.9 11.9 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-2.786 0-5.405-.996-7.452-2.766a.515.515 0 00-.52-.071l-3.113 1.494 1.491-3.373a.52.52 0 00-.062-.561A9.598 9.598 0 012.4 12C2.4 6.708 6.708 2.4 12 2.4S21.6 6.708 21.6 12 17.292 21.6 12 21.6z"/>
                    </svg>
                    Falar com Suporte
                  </Button>
                </div>
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
                            <span className={`ml-2 text-xs font-normal px-2 py-0.5 ${user?.payment_status === 'atrasado' ? 'bg-red-600' : 'bg-green-700'} text-white rounded`}>
                              {user?.payment_status === 'atrasado' ? 'Atrasado' : 'Ativo'}
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
                          {user?.payment_status === "atrasado" ? (
                            <span className="text-red-500">Pagamento atrasado! Atualize seu plano</span>
                          ) : (
                            <>
                              Seus créditos renovam no dia {formatarData(obterDataRenovacao())}
                              {user?.payment_status === "atrasado" && (
                                <div className="mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 border-red-500 hover:bg-red-500/10"
                                    onClick={() => window.open("https://api.whatsapp.com?phone=5517992695422?text=Minha assinatura está atrasada, gostaria de ajustar minha assinatura", "_blank")}
                                  >
                                    Ajustar pagamento
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
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
                            {checklistItems?.map((item, index) => {
                              // Relacionar checklist com os campos check1, check2, check3 do tier
                              let isChecked = false;
                              
                              if (index === 0 && tier.check1 === "sim") {
                                isChecked = true;
                              } else if (index === 1 && tier.check2 === "sim") {
                                isChecked = true;
                              } else if (index === 2 && tier.check3 === "sim") {
                                isChecked = true;
                              }
                              
                              return (
                                <li key={item.id} className="flex items-start">
                                  <div className="mr-2 mt-0.5">
                                    {isChecked ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <X className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-sm ${
                                      isChecked
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {item.descricao}
                                  </span>
                                </li>
                              );
                            })}
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
                  

                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
