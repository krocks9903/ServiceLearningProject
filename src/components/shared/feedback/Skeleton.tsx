import React from "react";
import "./Skeleton.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1rem",
  borderRadius,
  className = "",
  variant = "text",
  animation = "pulse",
  style: customStyle,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...customStyle,
  };

  if (borderRadius !== undefined) {
    style.borderRadius =
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
  } else {
    // Default border radius based on variant
    if (variant === "circular") {
      style.borderRadius = "50%";
    } else if (variant === "text") {
      style.borderRadius = "4px";
    } else {
      style.borderRadius = "8px";
    }
  }

  return (
    <div
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Card Skeleton
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`skeleton-card ${className}`}>
    <Skeleton variant="rectangular" height={200} />
    <div style={{ padding: "1rem" }}>
      <Skeleton
        width="60%"
        height="1.5rem"
        style={{ marginBottom: "0.5rem" }}
      />
      <Skeleton width="100%" height="1rem" style={{ marginBottom: "0.5rem" }} />
      <Skeleton width="80%" height="1rem" />
    </div>
  </div>
);

// List Item Skeleton
export const SkeletonListItem: React.FC<{
  showAvatar?: boolean;
  className?: string;
}> = ({ showAvatar = true, className = "" }) => (
  <div className={`skeleton-list-item ${className}`}>
    {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
    <div style={{ flex: 1 }}>
      <Skeleton
        width="40%"
        height="1.2rem"
        style={{ marginBottom: "0.5rem" }}
      />
      <Skeleton width="70%" height="1rem" />
    </div>
  </div>
);

// Table Row Skeleton
export const SkeletonTableRow: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 4, className = "" }) => (
  <div className={`skeleton-table-row ${className}`}>
    {Array.from({ length: columns }).map((_, index) => (
      <Skeleton key={index} height="1rem" style={{ margin: "0.5rem" }} />
    ))}
  </div>
);

// Text Block Skeleton
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => (
  <div className={`skeleton-text ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? "60%" : "100%"}
        height="1rem"
        style={{ marginBottom: "0.5rem" }}
      />
    ))}
  </div>
);

// Dashboard Card Skeleton
export const SkeletonDashboardCard: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`skeleton-dashboard-card ${className}`}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <Skeleton width="40%" height="1.5rem" />
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton width="30%" height="2rem" style={{ marginBottom: "0.5rem" }} />
    <Skeleton width="60%" height="1rem" />
  </div>
);

// Event Card Skeleton
export const SkeletonEventCard: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`skeleton-event-card ${className}`}>
    <Skeleton
      variant="rectangular"
      height={150}
      style={{ marginBottom: "1rem" }}
    />
    <Skeleton width="70%" height="1.5rem" style={{ marginBottom: "0.5rem" }} />
    <Skeleton width="50%" height="1rem" style={{ marginBottom: "0.5rem" }} />
    <Skeleton width="80%" height="1rem" style={{ marginBottom: "1rem" }} />
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Skeleton width={80} height={32} borderRadius={4} />
      <Skeleton width={80} height={32} borderRadius={4} />
    </div>
  </div>
);

// Table Skeleton
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = "" }) => (
  <div className={`skeleton-table ${className}`}>
    <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} width={`${100 / columns}%`} height="2rem" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, index) => (
      <SkeletonTableRow key={index} columns={columns} />
    ))}
  </div>
);
