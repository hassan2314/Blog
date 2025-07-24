import React from "react";

const Skeleton = ({
  className = "",
  variant = "rectangle", // 'rectangle', 'circle', 'text'
  lines = 1,
  height,
  width,
  rounded = "default", // 'none', 'sm', 'default', 'lg', 'full'
  animation = "pulse", // 'pulse', 'wave', 'none'
}) => {
  // Determine rounded classes based on props
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    default: "rounded",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Determine animation classes
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-wave", // You'll need to define this animation in your CSS
    none: "",
  };

  // If it's a text skeleton with multiple lines
  if (variant === "text" && lines > 1) {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            className={`bg-gray-200 ${animationClasses[animation]} ${
              i === lines - 1 ? "w-3/4" : "w-full"
            } ${roundedClasses[rounded]}`}
            style={{
              height: height || "1rem",
              width: i === lines - 1 ? "75%" : width || "100%",
            }}
          />
        ))}
      </div>
    );
  }

  // For single elements
  return (
    <div
      className={`bg-gray-200 ${animationClasses[animation]} ${
        variant === "circle" ? "rounded-full" : roundedClasses[rounded]
      } ${className}`}
      style={{
        height: height || (variant === "text" ? "1rem" : "100%"),
        width: width || (variant === "circle" ? height || "2rem" : "100%"),
      }}
    />
  );
};

export default Skeleton;
