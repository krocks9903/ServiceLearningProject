import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  inputSize = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputWrapperClass = [
    'input-wrapper',
    fullWidth && 'input-full-width',
    icon && `input-with-icon-${iconPosition}`,
    error && 'input-error',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClass = ['input', `input-${inputSize}`, className].filter(Boolean).join(' ');

  return (
    <div className={inputWrapperClass}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-container">
        {icon && iconPosition === 'left' && <span className="input-icon input-icon-left">{icon}</span>}
        <input id={inputId} className={inputClass} {...props} />
        {icon && iconPosition === 'right' && <span className="input-icon input-icon-right">{icon}</span>}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
};

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  textareaSize?: 'sm' | 'md' | 'lg';
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  textareaSize = 'md',
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const wrapperClass = [
    'input-wrapper',
    fullWidth && 'input-full-width',
    error && 'input-error',
  ]
    .filter(Boolean)
    .join(' ');

  const textareaClass = ['textarea', `textarea-${textareaSize}`, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={textareaId} className="input-label">
          {label}
        </label>
      )}
      <textarea id={textareaId} className={textareaClass} {...props} />
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
};
