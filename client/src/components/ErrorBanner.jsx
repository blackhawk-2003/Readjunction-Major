import React, { useEffect, useState } from "react";
import "../styles/ErrorBanner.css";

const ErrorBanner = ({ message, duration = 3000, onClose, type = "error" }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;
    setProgress(100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`error-banner${
        type === "success" ? " error-banner--success" : ""
      }`}
    >
      <span>{message}</span>
      <div
        className="error-banner-progress"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ErrorBanner;
