import React from "react";
import "../styles/ProgressBar.css";

const ProgressBar = ({ loading, text }) => {
  if (!loading) return null;
  return (
    <div className="progress-bar__overlay">
      <div className="progress-bar__spinner"></div>
      {text && <div className="progress-bar__text">{text}</div>}
    </div>
  );
};

export default ProgressBar;
