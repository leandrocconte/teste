import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Download, Loader2 } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useRef, useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/components/chat-message";
import { Message, List } from "@shared/schema";
import { AIAvatar } from "@/components/ui/ai-avatar";

export default function ChatPage() {
  const { listId } = useParams();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  const [newMessage, setNewMessage] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [noResponsesWarningShown, setNoResponsesWarningShown] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get selected category
  const { data: lists } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });
  
  const selectedList = lists?.find(list => list.id === Number(listId));
  
  // Get messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${listId}`],
    enabled: !!listId,
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
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
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
    
    try {
      await sendMessageMutation.mutateAsync(messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsMessageLoading(false);
    }
  };
  
  const handleClearChat = () => {
    if (window.confirm("Tem certeza que deseja limpar toda a conversa?")) {
      // In a real app, this would call an API to delete messages
      alert("Funcionalidade não implementada");
    }
  };
  
  // Handle quick prompts
  const handleQuickPrompt = (prompt: string) => {
    setNewMessage(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="font-semibold">{selectedList?.title || "Chat com IA"}</h2>
                  <p className="text-muted-foreground text-sm">
                    <span>{user?.responses_available}</span> respostas restantes
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleClearChat}>
                        <Trash2 size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Limpar conversa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Download size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exportar conversa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Chat Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-4" 
            ref={chatContainerRef}
          >
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Welcome Message */}
              {messages?.length === 0 && !messagesLoading && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
                    <Button
                      variant="outline"
                      className="text-left h-auto py-3 justify-start"
                      onClick={() => handleQuickPrompt("Explique de forma simples sobre este assunto")}
                    >
                      <p>Explique de forma simples sobre este assunto</p>
                    </Button>
                    <Button
                      variant="outline"
                      className="text-left h-auto py-3 justify-start"
                      onClick={() => handleQuickPrompt("Quais são as melhores práticas para este tema?")}
                    >
                      <p>Quais são as melhores práticas para este tema?</p>
                    </Button>
                  </div>
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
              {messages?.map((message, index) => (
                <div key={message.id}>
                  {/* User Message */}
                  <ChatMessage
                    content={message.content}
                    sender="user"
                    timestamp={new Date(message.created_at)}
                    userName={user?.name || ""}
                  />
                  
                  {/* AI Response */}
                  {message.ai_response && (
                    <ChatMessage
                      content={message.ai_response}
                      sender="ai"
                      timestamp={new Date(message.created_at)}
                      userName="AI Assistant"
                    />
                  )}
                </div>
              ))}
              
              {/* Loading Indicator for sending message */}
              {isMessageLoading && (
                <div className="flex items-center space-x-2 px-4 py-3 bg-secondary rounded-xl max-w-max">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0s"}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Message Input */}
          <div className="border-t border-border p-4 bg-card">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
              <div className="relative">
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
                  className="absolute right-3 top-3 p-2 rounded-full"
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
                  {user?.responses_available > 0 ? (
                    <>
                      <span className="text-primary">{user.responses_available}</span> respostas restantes
                    </>
                  ) : (
                    <span className="text-red-500">Sem respostas disponíveis</span>
                  )}
                </span>
                {user?.responses_available === 0 && (
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
        </main>
      </div>
    </div>
  );
}
