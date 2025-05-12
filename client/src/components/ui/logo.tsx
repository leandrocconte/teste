import { CSSProperties } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}

export function Logo({ size = "md", className = "", style }: LogoProps) {
  // Definimos apenas a largura (width) e a altura será automática para manter a proporção
  const sizeClass = {
    sm: "w-24",
    md: "w-32",
    lg: "w-40"
  }[size];

  return (
    <img 
      src="/assets/logoptanova.png" 
      alt="Logo" 
      className={`${sizeClass} ${className} object-contain`} 
      style={style}
    />
  );
}