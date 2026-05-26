import React, { useState, useEffect, useRef } from 'react';
import HttpService from '../services/HttpService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await HttpService.get('/notifications');
      const data = Array.isArray(response) ? response : [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await HttpService.put(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await HttpService.put('/notifications/read-all', {});
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_change': return '';
      case 'comment': return '';
      case 'feedback_resolved': return '';
      case 'mention': return '@';
      default: return '';
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="notification-button"
        aria-label="Toggle notifications"
      >
        <svg className="bell-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A3A66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-icon"></div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={(e) => markAsRead(notif.id, e)}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-message">{notif.message}</p>
                    <p className="notification-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && <div className="unread-dot"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;