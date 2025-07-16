import React, { useState, useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";
import "./LogoutSuccess.css";

const LogoutSuccess = ({ onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 3.33; // 3 seconds total
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div className="logout-success">
      <div className="logout-success-content">
        <FiCheckCircle className="logout-success-icon" />
        <span>Logout Successful</span>
        <p>You have been successfully logged out</p>
      </div>
      <div
        className="logout-success-progress"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default LogoutSuccess;
