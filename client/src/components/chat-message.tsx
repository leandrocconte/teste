import { AIAvatar } from "@/components/ui/ai-avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatMessageProps {
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  userName: string;
}

export function ChatMessage({ content, sender, timestamp, userName }: ChatMessageProps) {
  // Function to format message text with line breaks
  const formatMessage = (text: string) => {
    return text
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");
  };
  
  // Format timestamp
  const formattedTime = format(new Date(timestamp), "HH:mm", { locale: ptBR });
  
  return (
    <div
      className={cn(
        "chat-message",
        sender === "user" ? "ml-8 md:ml-16" : "mr-8 md:mr-16"
      )}
    >
      <div className={cn(
        "flex items-start",
        sender === "user" ? "justify-end" : ""
      )}>
        {/* AI Avatar */}
        {sender === "ai" && (
          <div className="flex-shrink-0 mr-3">
            <AIAvatar size="sm" />
          </div>
        )}
        
        {/* Message Content */}
        <div
          className={cn(
            "rounded-2xl p-4 max-w-[80%]",
            sender === "user" 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <div 
            className="whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
          />
        </div>
        
        {/* User Avatar */}
        {sender === "user" && (
          <div className="flex-shrink-0 ml-3">
            <UserAvatar name={userName} size="sm" />
          </div>
        )}
      </div>
      
      {/* Timestamp */}
      <div 
        className={cn(
          "text-xs text-muted-foreground mt-1",
          sender === "user" ? "text-right" : "text-left"
        )}
      >
        {formattedTime}
      </div>
    </div>
  );
}
