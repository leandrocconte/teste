import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Menu, X, LogOut, Bot, CrownIcon, TicketIcon } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useRef, useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/components/chat-message";
import { Message, List, Tier } from "@shared/schema";
import { AIAvatar } from "@/components/ui/ai-avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatPage() {
  const { listId } = useParams();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  const [newMessage, setNewMessage] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [noResponsesWarningShown, setNoResponsesWarningShown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempMessage, setTempMessage] = useState<{ content: string; timestamp: Date } | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get selected category
  const { data: lists } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });
  
  const selectedList = lists?.find(list => list.id === Number(listId));
  
  // Get messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${listId}`],
    enabled: !!listId,
    onSuccess: () => {
      // Scroll to bottom when messages are loaded
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        content: messageContent,
        user_id: user?.id,
        lista_id: Number(listId)
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate messages query to refresh the chat
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${listId}`] });
      // Also invalidate user query to get updated responses_available
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
  
  // Auto-scroll to bottom when messages change or when temp message appears
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, tempMessage]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [newMessage]);
  
  // Show warning when no responses available
  useEffect(() => {
    if (user?.responses_available === 0 && !noResponsesWarningShown) {
      setNoResponsesWarningShown(true);
    }
  }, [user?.responses_available, noResponsesWarningShown]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isMessageLoading || !user || user.responses_available <= 0) {
      return;
    }
    
    setIsMessageLoading(true);
    const messageContent = newMessage.trim();
    setNewMessage("");
    
    // Mostrar a mensagem do usuário imediatamente
    setTempMessage({
      content: messageContent,
      timestamp: new Date()
    });
    
    try {
      await sendMessageMutation.mutateAsync(messageContent);
      // Após receber a resposta, limpar a mensagem temporária
      setTempMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
      // Manter a mensagem temporária em caso de erro para não perder o contexto
    } finally {
      setIsMessageLoading(false);
    }
  };
  
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
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com hamburger menu e título do chat */}
      <header className="bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-secondary transition"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="text-lg font-medium">
          <h2 className="flex items-center">
            {selectedList?.title || "Chat com IA"}
          </h2>
        </div>
        
        <div className="w-8"></div>
      </header>
      
      {/* Área de mensagens (scroll) */}
      {/* Sidebar */}
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
      
      {/* Chat Messages Area - Área de scroll */}
      <div 
        className="flex-1 overflow-y-auto p-4 relative" 
        ref={chatContainerRef}
        style={{ height: "calc(100vh - 132px)" }}
      >
        {/* Overlay de pagamento atrasado */}
        {user?.payment_status === "atrasado" && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="bg-card p-6 rounded-lg border border-red-500 shadow-lg max-w-md text-center">
              <h3 className="text-xl font-semibold text-red-500 mb-4">Assinatura Atrasada</h3>
              <p className="mb-4">Sua assinatura está atrasada. Para continuar usando o chat, atualize seu pagamento.</p>
              <Button 
                onClick={() => navigate("/subscription")}
                className="mr-2"
              >
                Ajustar Pagamento
              </Button>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && !messagesLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full mx-auto flex items-center justify-center mb-4">
                <AIAvatar />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bem-vindo ao chat</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Estou aqui para ajudar com{" "}
                <span className="text-primary">{selectedList?.title?.toLowerCase() || "este tema"}</span>. 
                Como posso te auxiliar hoje?
              </p>
            </div>
          )}
          
          {/* Loading */}
          {messagesLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {/* No Responses Available Warning */}
          {user?.responses_available === 0 && noResponsesWarningShown && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-lg p-4 animate-pulse">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5 text-red-500">!</div>
                <div>
                  <h4 className="font-medium text-red-500">Sem respostas disponíveis</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Você atingiu o limite de respostas para o seu plano atual.
                  </p>
                  <div className="mt-3">
                    <Button 
                      size="sm"
                      onClick={() => navigate("/subscription")}
                    >
                      Gerenciar Assinatura
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Message Thread */}
          {messages.map((message) => (
            <div key={message.id}>
              {/* User Message */}
              <ChatMessage
                content={message.content}
                sender="user"
                timestamp={new Date(message.created_at || Date.now())}
                userName={user?.name || ""}
              />
              
              {/* AI Response */}
              {message.ai_response && (
                <ChatMessage
                  content={message.ai_response}
                  sender="ai"
                  timestamp={new Date(message.created_at || Date.now())}
                  userName="AI Assistant"
                />
              )}
            </div>
          ))}
          
          {/* Temporary User Message - mostrada enquanto aguarda resposta da API */}
          {tempMessage && (
            <div key="temp-message">
              <ChatMessage
                content={tempMessage.content}
                sender="user"
                timestamp={tempMessage.timestamp}
                userName={user?.name || ""}
              />
              {isMessageLoading && (
                <div className="flex items-start space-x-3 ml-2 animate-pulse">
                  <div className="flex-shrink-0">
                    <AIAvatar size="sm" />
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-secondary text-muted-foreground text-sm">
                    Digitando...
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* O indicador de carregamento global foi removido, pois agora mostramos como parte da mensagem temporária */}
        </div>
      </div>
      
      {/* Message Input - Fixo na parte inferior */}
      <div className="border-t border-border p-4 bg-card sticky bottom-0 left-0 right-0 z-10">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Digite sua mensagem..."
              className="resize-none pr-12 min-h-[52px] max-h-32"
              disabled={user?.responses_available === 0 || isMessageLoading}
              ref={textareaRef}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-[50%] transform -translate-y-1/2 p-2 rounded-full"
              disabled={
                user?.responses_available === 0 || 
                isMessageLoading || 
                !newMessage.trim()
              }
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
            <span>
              {user && user.responses_available !== undefined && user.responses_available > 0 ? (
                <>
                  <span className="text-primary">{user.responses_available}</span> respostas restantes
                </>
              ) : (
                <span className="text-red-500">Sem respostas disponíveis</span>
              )}
            </span>
            {user && user.responses_available !== undefined && user.responses_available === 0 && (
              <Button
                variant="link"
                size="sm"
                className="text-primary p-0 h-auto"
                onClick={() => navigate("/subscription")}
              >
                Atualizar plano
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}