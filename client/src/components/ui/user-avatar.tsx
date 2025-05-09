import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} bg-primary`}>
      <AvatarFallback className="text-white font-medium">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
