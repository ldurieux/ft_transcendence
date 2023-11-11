import React, { useEffect, useState } from 'react';
import "./notif.css";

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    // Close the notification after a certain time (e.g., 5 seconds)
    const timeoutId = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div className="notification">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

interface NotificationPopupProps {
  notifications: string[];
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notifications }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [currentNotification, setCurrentNotification] = useState<string>('');

  const showNotification = (message: string) => {
    setCurrentNotification(message);
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
    setCurrentNotification('');
  };

  useEffect(() => {
    // Show the latest notification
    if (notifications.length > 0) {
      showNotification(notifications[notifications.length - 1]);
    }
  }, [notifications]);

  useEffect(() => {
    // Reset visibility state when a new notification is received
    setVisible(false);
  }, [currentNotification]);

  return (
    <div className="notification-popup">
      {visible && (
        <Notification message={currentNotification} onClose={hideNotification} />
      )}
    </div>
  );
};

export default NotificationPopup;
