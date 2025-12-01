import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const buttonClass = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    isLoading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClass} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <span className="btn-spinner" />
          <span className="btn-loading-text">Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon btn-icon-left">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="btn-icon btn-icon-right">{icon}</span>}
        </>
      )}
    </button>
  );
};
