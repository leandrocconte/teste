import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Bot, 
  CrownIcon, 
  TicketIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  responsive?: boolean;
}

export function Sidebar({ responsive = true }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { data: tiers } = useQuery({
    queryKey: ["/api/tiers"],
    enabled: !!user,
  });
  
  // Get user's tier
  const userTier = tiers?.find(tier => tier.tier_id === user?.tier_id);
  
  const navigationItems = [
    { id: "library", title: "Biblioteca de IAs", icon: <Bot size={20} />, path: "/" },
    { id: "subscription", title: "Gerenciar Assinatura", icon: <CrownIcon size={20} />, path: "/subscription" },
    { id: "partners", title: "Descontos com Parceiros", icon: <TicketIcon size={20} />, path: "/partners" },
  ];
  
  // Close sidebar when navigating (always use menu hamburger)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Determine if a nav item is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  // Fix para o erro de type em tiers?.find
  const userTierFixed = tiers ? tiers.find(tier => tier.tier_id === user?.tier_id) : undefined;
  
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
        {responsive && (
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1 hover:bg-secondary rounded"
          >
            <X size={20} />
          </button>
        )}
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
                  ? "bg-primary bg-opacity-20 text-primary"
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
                  disabled={logoutMutation.isPending}
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
  
  // Header with hamburger menu (sempre visível em todos os tamanhos de tela)
  const appHeader = (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        className="p-2 rounded-md hover:bg-secondary transition"
      >
        <Menu size={20} />
      </button>
      <div className="text-lg font-medium flex items-center">
        {location === "/" && "Biblioteca de IAs"}
        {location.startsWith("/chat") && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={() => navigate("/")}
            >
              <ChevronRight size={16} className="rotate-180" />
            </Button>
            <span>Chat com IA</span>
          </>
        )}
        {location === "/subscription" && "Gerenciar Assinatura"}
        {location === "/partners" && "Descontos com Parceiros"}
      </div>
      <div className="w-8"></div>
    </header>
  );
  
  return (
    <>
      {/* Sempre mostrar o header com menu hamburger */}
      {appHeader}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar sempre é um overlay, independente do tamanho da tela */}
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
      </div>
    </>
  );
}
