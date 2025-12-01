import React from 'react';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = '#4a90e2',
  className = '',
}) => {
  const spinnerClass = ['spinner', `spinner-${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={spinnerClass} style={{ borderTopColor: color }} role="status" aria-label="Loading">
      <span className="spinner-sr-only">Loading...</span>
    </div>
  );
};

export interface SpinnerOverlayProps {
  message?: string;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({ message = 'Loading...' }) => (
  <div className="spinner-overlay">
    <div className="spinner-overlay-content">
      <Spinner size="lg" />
      {message && <p className="spinner-overlay-message">{message}</p>}
    </div>
  </div>
);
