import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, Menu, X, LogOut, Bot, CrownIcon, TicketIcon } from "lucide-react";
import { List, Tier } from "@shared/schema";
import { useRef, useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AILibraryPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { data: lists, isLoading: listsLoading } = useQuery<List[]>({
    queryKey: ["/api/lists"],
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
  
  const handleSelectCategory = (id: number) => {
    navigate(`/chat/${id}`);
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
        <div className="text-lg font-medium">Biblioteca de IAs</div>
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
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Biblioteca de IAs</h1>
                <p className="text-muted-foreground mt-1">
                  Escolha uma categoria para começar a conversar
                </p>
              </div>
              
              {listsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lists?.map((category) => (
                    <div 
                      key={category.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition cursor-pointer"
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {category.image_url && (
                          <img 
                            src={category.image_url} 
                            alt={category.title} 
                            className="w-full h-full object-cover transition duration-500 hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                        {category.tag && (
                          <div className="absolute bottom-0 left-0 p-4">
                            <span className="inline-block bg-primary text-white px-2 py-1 rounded text-sm font-medium">
                              {category.tag}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                        <div className="flex justify-end items-center">
                          <Button size="sm">
                            Iniciar chat
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
