import React from "react";
import "./Badge.css";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const badgeClass = ["badge", `badge-${variant}`, `badge-${size}`, className]
    .filter(Boolean)
    .join(" ");

  return <span className={badgeClass}>{children}</span>;
};
