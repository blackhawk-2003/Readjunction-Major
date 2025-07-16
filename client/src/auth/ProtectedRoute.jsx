import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { FiAlertTriangle } from "react-icons/fi";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowWarning(true);
      setProgress(100);
    }
  }, [isAuthenticated, loading]);

  // Auto-dismiss warning after 3 seconds with progress bar
  useEffect(() => {
    if (showWarning) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            setShowWarning(false);
            return 0;
          }
          return prev - 3.33; // 3 seconds total (100 / 3.33 ≈ 30 steps)
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showWarning]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="protected-route-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, show warning and redirect to login
  const justLoggedOut = sessionStorage.getItem("justLoggedOut");
  if (!isAuthenticated) {
    // Suppress warning if just logged out
    if (justLoggedOut) {
      sessionStorage.removeItem("justLoggedOut");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return (
      <div className="protected-route-container">
        {showWarning && (
          <div className="protected-route-warning">
            <div className="protected-route-warning-content">
              <FiAlertTriangle className="protected-route-warning-icon" />
              <span>Login Required</span>
              <p>Please log in to access this page</p>
            </div>
            <div
              className="protected-route-warning-progress"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <Navigate to="/login" state={{ from: location }} replace />
      </div>
    );
  }

  // If role is required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="protected-route-container">
        {showWarning && (
          <div className="protected-route-warning">
            <div className="protected-route-warning-content">
              <FiAlertTriangle className="protected-route-warning-icon" />
              <span>Access Denied</span>
              <p>You don't have permission to access this page</p>
            </div>
            <div
              className="protected-route-warning-progress"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <Navigate to="/" replace />
      </div>
    );
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;
