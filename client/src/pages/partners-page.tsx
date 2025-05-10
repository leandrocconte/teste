import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, X, Bot, CrownIcon, TicketIcon, LogOut } from "lucide-react";
import { Parceiro, Tier } from "@shared/schema";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function PartnersPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { data: partners, isLoading: partnersLoading } = useQuery<Parceiro[]>({
    queryKey: ["/api/partners"],
  });
  
  // Get tiers data
  const { data: tiers } = useQuery<Tier[]>({
    queryKey: ["/api/tiers"],
    enabled: !!user,
  });
  
  // Fix para o erro de type em tiers?.find
  const userTier = Array.isArray(tiers) ? tiers.find((tier: any) => tier.tier_id === user?.tier_id) : undefined;
  
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
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      navigate("/auth");
    },
  });

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
  
  const handleOpenPartnerLink = (url: string) => {
    window.open(url, '_blank');
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
        <div className="text-lg font-medium">Descontos com Parceiros</div>
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
        <main className="flex-1 overflow-auto w-full">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-screen-xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">Descontos com Parceiros</h1>
                <p className="text-muted-foreground mt-1">
                  Aproveite ofertas exclusivas dos nossos parceiros
                </p>
              </div>
              
              {partnersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners?.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition cursor-pointer"
                      onClick={() => handleOpenPartnerLink(partner.link)}
                    >
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {partner.image_url && (
                          <img
                            src={partner.image_url}
                            alt={partner.name}
                            className="w-full h-full object-cover transition duration-500 hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60"></div>
                        <div className="absolute top-0 right-0 p-3">
                          <span 
                            className={`inline-block ${
                              partner.discount.includes("OFF") 
                                ? "bg-red-500" 
                                : partner.discount.includes("GRÁTIS") 
                                ? "bg-green-500" 
                                : "bg-blue-500"
                            } text-white px-2 py-1 rounded text-sm font-medium`}
                          >
                            {partner.discount}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{partner.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">{partner.valid_until}</span>
                          <Button size="sm">
                            Ver oferta
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
