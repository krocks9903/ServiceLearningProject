import React, { useState, useRef, useEffect } from "react";
import { theme } from "../../../constants/theme";
import Calendar from "../navigation/Calendar";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function DatePicker({
  value = "",
  onChange,
  placeholder = "Select date",
  label,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  showTime = false,
  className,
  style,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date) => {
    if (showTime) {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDateSelect = (slotInfo: { start: Date; end: Date }) => {
    const selectedDate = slotInfo.start;
    setSelectedDate(selectedDate);

    if (showTime) {
      // Format date in local timezone, not UTC
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const hours = String(selectedDate.getHours()).padStart(2, "0");
      const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      onChange(localDateTime);
    } else {
      // Format date only in local timezone
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const localDate = `${year}-${month}-${day}`;
      onChange(localDate);
    }

    setIsOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange("");
  };

  const styles = {
    container: {
      position: "relative" as const,
      width: "100%",
      minWidth: "200px",
      maxWidth: "100%",
      ...style,
    },
    label: {
      display: "block",
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: "0.5rem",
    },
    inputContainer: {
      position: "relative" as const,
      width: "100%",
    },
    input: {
      width: "100%",
      minWidth: "180px",
      maxWidth: "100%",
      padding: "0.75rem 2.5rem 0.75rem 0.75rem",
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      backgroundColor: disabled
        ? theme.colors.neutral[100]
        : theme.colors.white,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transitions.base,
      boxSizing: "border-box",
      "&:focus": {
        outline: "none",
        borderColor: theme.colors.primary,
        boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
      },
      "&:hover": {
        borderColor: disabled
          ? theme.colors.neutral[300]
          : theme.colors.primary,
      },
    },
    calendarIcon: {
      position: "absolute" as const,
      right: "0.75rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: theme.colors.text.secondary,
      pointerEvents: "none" as const,
    },
    clearButton: {
      position: "absolute" as const,
      right: "2.5rem",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: theme.colors.text.secondary,
      cursor: "pointer",
      padding: "0.25rem",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem",
      "&:hover": {
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.neutral[100],
      },
    },
    dropdown: {
      position: "absolute" as const,
      top: "100%",
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: theme.colors.white,
      border: `1px solid ${theme.colors.neutral[200]}`,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.lg,
      marginTop: "0.25rem",
      overflow: "hidden",
    },
    calendarContainer: {
      padding: "1rem",
    },
    required: {
      color: theme.colors.error,
    },
  };

  return (
    <div ref={containerRef} style={styles.container} className={className}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      )}

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ""}
          placeholder={placeholder}
          onClick={handleInputClick}
          readOnly
          disabled={disabled}
          style={{
            ...styles.input,
            ...(isOpen
              ? {
                  borderColor: theme.colors.primary,
                  boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
                }
              : {}),
          }}
        />

        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            title="Clear date"
          >
            ×
          </button>
        )}

        <div style={styles.calendarIcon}>📅</div>
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.calendarContainer}>
            <Calendar
              events={[]}
              onSelectSlot={handleDateSelect}
              selectable={true}
              popup={false}
              showToolbar={true}
              height={400}
            />
          </div>
        </div>
      )}
    </div>
  );
}
