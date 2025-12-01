import React from "react";
import "./Card.css";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  onClick,
  hoverable = false,
  style,
}) => {
  const cardClass = [
    "card",
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable && "card-hoverable",
    onClick && "card-clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClass}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={style}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => <div className={`card-header ${className}`}>{children}</div>;

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = "",
}) => <div className={`card-body ${className}`}>{children}</div>;

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => <div className={`card-footer ${className}`}>{children}</div>;
