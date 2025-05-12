import { CSSProperties } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}

export function Logo({ size = "md", className = "", style }: LogoProps) {
  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }[size];

  return (
    <img 
      src="/src/assets/logo.png" 
      alt="Logo" 
      className={`${sizeClass} ${className}`} 
      style={style}
    />
  );
}