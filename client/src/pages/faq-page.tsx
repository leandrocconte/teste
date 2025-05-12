import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, X, Bot, CrownIcon, TicketIcon, LogOut, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Logo } from "@/components/ui/logo";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigationItems = [
    { id: "library", title: "Biblioteca de IAs", icon: <Bot size={20} />, path: "/" },
    { id: "subscription", title: "Gerenciar Assinatura", icon: <CrownIcon size={20} />, path: "/subscription" },
    { id: "partners", title: "Descontos com Parceiros", icon: <TicketIcon size={20} />, path: "/partners" },
    { id: "faq", title: "Perguntas Frequentes", icon: <HelpCircle size={20} />, path: "/faq" },
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
        <div className="flex items-center justify-center">
          <Logo size="md" />
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
  
  // Lista de perguntas frequentes
  const faqs = [
    {
      question: "Como funciona o limite de respostas?",
      answer: "Cada plano inclui um número específico de respostas da IA por mês. Você pode visualizar seu saldo na página principal ou no menu lateral. Os créditos são renovados automaticamente a cada 30 dias, de acordo com seu plano."
    },
    {
      question: "Os créditos acumulam se eu não usá-los?",
      answer: "Não, os créditos não acumulam entre os ciclos de renovação. A cada renovação, seu saldo é atualizado para o limite do seu plano atual."
    },
    {
      question: "Como posso fazer upgrade do meu plano?",
      answer: "Você pode fazer upgrade do seu plano a qualquer momento na página 'Gerenciar Assinatura'. Escolha o plano desejado e siga as instruções de pagamento."
    },
    {
      question: "Quais métodos de pagamento são aceitos?",
      answer: "Aceitamos pagamentos via cartão de crédito, boleto bancário e PIX. Para suporte com pagamentos, use o botão 'Falar com Suporte' na página de assinaturas."
    },
    {
      question: "O que acontece se minha assinatura atrasar?",
      answer: "Se sua assinatura atrasar por mais de 33 dias, seu acesso às respostas da IA será temporariamente limitado. Você pode regularizar o pagamento a qualquer momento através da página 'Gerenciar Assinatura'."
    },
    {
      question: "Como posso baixar minhas conversas?",
      answer: "No momento, a funcionalidade de exportação de conversas não está disponível, mas estamos trabalhando para implementá-la em uma atualização futura."
    },
    {
      question: "Quais categorias de IA estão disponíveis?",
      answer: "Oferecemos várias categorias especializadas, incluindo Biomecânica, Marketing de Instagram, Ciência e outras. Cada categoria é otimizada para fornecer respostas específicas em sua área de conhecimento."
    },
    {
      question: "Quanto tempo as conversas ficam armazenadas?",
      answer: "Suas conversas ficam armazenadas indefinidamente, desde que sua conta permaneça ativa. Você pode acessá-las a qualquer momento através da interface do chat."
    }
  ];

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
        <div className="flex justify-center items-center">
          <Logo size="md" />
        </div>
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
                <h1 className="text-2xl font-bold">Perguntas Frequentes</h1>
                <p className="text-muted-foreground mt-1">
                  Encontre respostas para as dúvidas mais comuns
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              
              <div className="mt-8 bg-muted p-5 rounded-xl border border-border">
                <h3 className="font-semibold mb-2">Precisa de mais ajuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Se você não encontrou a resposta para sua pergunta, entre em contato com nossa equipe de suporte.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://api.whatsapp.com?phone=5517992695422&text=Preciso de ajuda com o IA Chat", "_blank")}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}