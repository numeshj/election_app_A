import React, { useState, useEffect } from 'react';
import './Notification.css';

function Notification({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !visible) return null;

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={() => {
        setVisible(false);
        if (onClose) onClose();
      }}>
        ×
      </button>
    </div>
  );
}

export default Notification;
