import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AIAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function AIAvatar({ size = "md" }: AIAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} bg-white`}>
      <AvatarFallback className="text-background font-medium">
        IA
      </AvatarFallback>
    </Avatar>
  );
}
