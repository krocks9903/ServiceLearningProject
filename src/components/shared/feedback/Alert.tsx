import React from "react";
import "./Alert.css";

export interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  icon,
  className = "",
}) => {
  const alertClass = ["alert", `alert-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const defaultIcons = {
    info: "ℹ️",
    success: "✓",
    warning: "⚠️",
    danger: "✕",
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className={alertClass} role="alert">
      <div className="alert-content">
        {displayIcon && <span className="alert-icon">{displayIcon}</span>}
        <div className="alert-body">
          {title && <h4 className="alert-title">{title}</h4>}
          <div className="alert-message">{children}</div>
        </div>
      </div>
      {dismissible && (
        <button
          className="alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};
