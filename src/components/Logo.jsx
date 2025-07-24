import React from "react";
import { Link } from "react-router-dom";
import blogLogo from "/src/assets/blog.png"; // Proper import

const Logo = ({ width = "100px", className = "" }) => {
  // Fallback for missing image
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if fallback also fails
    e.target.src = "/src/assets/logo-fallback.png"; // Add a fallback image
    e.target.alt = "Blog logo fallback";
  };

  return (
    <Link
      to="/"
      className={`inline-block ${className}`}
      aria-label="Go to homepage"
    >
      <img
        src={blogLogo}
        alt="Blog Logo"
        width={width}
        height="auto" // Maintain aspect ratio
        className="h-auto object-contain" // Better responsive handling
        onError={handleImageError}
        loading="lazy" // Lazy loading for better performance
      />
    </Link>
  );
};

export default Logo;
