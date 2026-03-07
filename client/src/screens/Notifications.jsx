import React, { useState, useEffect } from "react";
import "./Notifications.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // All notification types
  const allNotifications = [
    {
      id: 1,
      type: "meeting",
      title: "Meeting Starting Soon",
      message: "Weekly Product Sync starts in 15 minutes",
      icon: "🔵",
      color: "#3b82f6",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "Andrea Lopez sent you a message in Product Team",
      icon: "💬",
      color: "#8b5cf6",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      read: false
    },
    {
      id: 3,
      type: "reminder",
      title: "Meeting Reminder",
      message: "Research Playback scheduled for tomorrow at 2:00 PM",
      icon: "📅",
      color: "#f59e0b",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: true
    },
    {
      id: 4,
      type: "team",
      title: "Team Update",
      message: "Leo Turner joined the Engineering team",
      icon: "👥",
      color: "#10b981",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: true
    },
    {
      id: 5,
      type: "system",
      title: "System Update",
      message: "New features available: Screen sharing and recording",
      icon: "⚙️",
      color: "#6366f1",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true
    },
    {
      id: 6,
      type: "meeting",
      title: "Meeting Ended",
      message: "UX Review meeting has ended. Recording available",
      icon: "📹",
      color: "#3b82f6",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true
    },
    {
      id: 7,
      type: "mention",
      title: "You were mentioned",
      message: "Sarah Chen mentioned you in a meeting note",
      icon: "📝",
      color: "#ec4899",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true
    },
    {
      id: 8,
      type: "recording",
      title: "Recording Ready",
      message: "Your meeting recording is ready to view",
      icon: "🎥",
      color: "#ef4444",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true
    }
  ];

  // Load notifications
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("zenith_notifications");
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // Convert timestamp strings back to Date objects with validation
        const withDates = parsed.map(n => {
          let date;
          if (n.timestamp instanceof Date) {
            // If it's already a Date object (shouldn't happen, but handle it)
            date = n.timestamp;
          } else if (typeof n.timestamp === 'string') {
            // Parse string to Date
            date = new Date(n.timestamp);
            // Validate the date
            if (isNaN(date.getTime())) {
              // If invalid, use current date as fallback
              console.warn('Invalid date found in notification, using current date');
              date = new Date();
            }
          } else if (typeof n.timestamp === 'number') {
            // If it's a timestamp number
            date = new Date(n.timestamp);
          } else {
            // Fallback to current date
            date = new Date();
          }
          
          return {
            ...n,
            timestamp: date
          };
        });
        setNotifications(withDates);
      } else {
        setNotifications(allNotifications);
        saveNotifications(allNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      // If there's an error, use default notifications and clear corrupted data
      try {
        localStorage.removeItem("zenith_notifications");
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      setNotifications(allNotifications);
      saveNotifications(allNotifications);
    }
  }, []);

  // Save notifications
  const saveNotifications = (notifs) => {
    try {
      // Convert Date objects to ISO strings for proper serialization
      const serializable = notifs.map(n => ({
        ...n,
        timestamp: n.timestamp instanceof Date 
          ? n.timestamp.toISOString() 
          : (typeof n.timestamp === 'string' 
            ? n.timestamp 
            : new Date(n.timestamp).toISOString())
      }));
      localStorage.setItem("zenith_notifications", JSON.stringify(serializable));
      setNotifications(notifs);
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
      // Still update state even if localStorage fails
      setNotifications(notifs);
    }
  };

  // Mark as read
  const markAsRead = (id) => {
    try {
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Dismiss notification
  const dismissNotification = (id) => {
    try {
      const updated = notifications.filter(n => n.id !== id);
      saveNotifications(updated);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // Clear all
  const clearAll = () => {
    try {
      if (window.confirm("Are you sure you want to clear all notifications?")) {
        saveNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      alert('Failed to clear notifications. Please try again.');
    }
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    try {
      // Ensure date is a valid Date object
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Recently";
      }
      
      const now = new Date();
      const diff = now - dateObj;
      
      // Handle negative differences (future dates)
      if (diff < 0) {
        return "Just now";
      }
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return "Recently";
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === "all" || n.type === filter;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={markAllAsRead} className="btn-mark-read" disabled={unreadCount === 0}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark all as read
          </button>
          <button onClick={clearAll} className="btn-clear-all" disabled={notifications.length === 0}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear all
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="notifications-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === "meeting" ? "active" : ""}`}
            onClick={() => setFilter("meeting")}
          >
            Meetings
          </button>
          <button
            className={`filter-tab ${filter === "message" ? "active" : ""}`}
            onClick={() => setFilter("message")}
          >
            Messages
          </button>
          <button
            className={`filter-tab ${filter === "team" ? "active" : ""}`}
            onClick={() => setFilter("team")}
          >
            Teams
          </button>
          <button
            className={`filter-tab ${filter === "system" ? "active" : ""}`}
            onClick={() => setFilter("system")}
          >
            Updates
          </button>
        </div>

        <div className="search-container">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-icon" style={{ background: `${notification.color}15` }}>
                <span className="icon-emoji">{notification.icon}</span>
              </div>

              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="btn-action mark"
                    title="Mark as read"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="btn-action dismiss"
                  title="Dismiss"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;