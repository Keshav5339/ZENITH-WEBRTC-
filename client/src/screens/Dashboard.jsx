import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MeetingsPage from "./Meetings";
import AnalyticsPage from "./Analytics";
import IntegrationsPage from "./Integrations";
import TeamsPage from "./Teams";
import NotificationsPage from "./Notifications";
import SupportPage from "./Support";
import SettingsContent from "./SettingsContent";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showStartMeetingModal, setShowStartMeetingModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("zenith_theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Ensure a default theme attribute is set
      document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zenith_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Close mobile menu when clicking overlay
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // Close mobile menu on window resize (when switching to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle sign out
  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      // Clear any stored data if needed
      alert("Signed out successfully!");
      window.location.href = "/";
    }
  };

  // Dummy data
  const stats = {
    totalMeetings: 24,
    totalChange: "+12%",
    activeParticipants: 156,
    participantsChange: "+8%",
    avgDuration: "42 min",
    durationChange: "+5%"
  };

  const activeSessions = [
    {
      id: 1,
      title: "Product Alignment",
      host: "Sarah Chen",
      participants: ["Sarah Chen", "John Doe", "Mike Ross"],
      tags: ["Q4 Roadmap", "Feature Priorities", "Resource Allocation"]
    },
    {
      id: 2,
      title: "Design Review",
      host: "Alex Rivera",
      participants: ["Alex Rivera", "Emma Stone"],
      tags: ["UI Mockups", "User Flow", "Accessibility"]
    }
  ];

  const teamPresence = [
    { name: "Sarah Chen", role: "Product Manager", status: "in a meeting", avatar: "👩‍💼" },
    { name: "Alex Rivera", role: "Design Lead", status: "available", avatar: "👨‍💻" },
    { name: "Jordan Kim", role: "Engineer", status: "in a meeting", avatar: "👨‍🔧" }
  ];

  const scheduleHighlights = [
    { title: "Weekly Sync", time: "Today, 3:00 PM", duration: "45 min" }
  ];

  const handleStartMeeting = () => {
    if (roomCode.trim()) {
      navigate(`/preview/${roomCode}`);
      setShowStartMeetingModal(false);
    }
  };

  const renderOverview = () => (
    <div className="overview-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Meetings</div>
            <div className="stat-value">{stats.totalMeetings}</div>
            <div className="stat-change positive">{stats.totalChange}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Active Participants</div>
            <div className="stat-value">{stats.activeParticipants}</div>
            <div className="stat-change positive">{stats.participantsChange}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Avg. Duration</div>
            <div className="stat-value">{stats.avgDuration}</div>
            <div className="stat-change positive">{stats.durationChange}</div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Active Sessions */}
        <div className="content-section">
          <div className="section-header">
            <h2>Active Sessions</h2>
            <p>Monitor ongoing conversations</p>
          </div>

          <div className="sessions-list">
            {activeSessions.map(session => (
              <div key={session.id} className="session-card">
                <h3>{session.title}</h3>
                <p className="session-host">Hosted by {session.host}</p>
                <div className="session-participants">
                  {session.participants.map((p, i) => (
                    <span key={i} className="participant-badge">{p.split(' ')[0]}</span>
                  ))}
                </div>
                <div className="session-tags">
                  {session.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="session-actions">
                  <button className="btn-join">Join Now</button>
                  <button className="btn-share">Share Link</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Team Presence */}
          <div className="presence-section">
            <div className="section-header">
              <h3>Team Presence</h3>
              <button className="btn-invite">Invite</button>
            </div>
            <p className="section-subtitle">See who is collaborating right now</p>

            <div className="presence-list">
              {teamPresence.map((member, i) => (
                <div key={i} className="presence-item">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                  <div className={`status-badge ${member.status === 'available' ? 'available' : 'busy'}`}>
                    {member.status === 'available' ? 'Available' : 'In a meeting'}
                  </div>
                </div>
              ))}
            </div>

            <div className="presence-actions">
              <button className="btn-huddle">Start Huddle</button>
              <button className="btn-chat">Open Chat</button>
            </div>
          </div>

          {/* Schedule */}
          <div className="schedule-section">
            <div className="section-header">
              <h3>Schedule Highlights</h3>
              <button className="btn-planner">Open Planner</button>
            </div>
            <p className="section-subtitle">Keep your next meetings on track</p>

            <div className="schedule-list">
              {scheduleHighlights.map((item, i) => (
                <div key={i} className="schedule-item">
                  <div className="schedule-icon">📅</div>
                  <div className="schedule-info">
                    <div className="schedule-title">{item.title}</div>
                    <div className="schedule-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle" 
        onClick={handleMobileMenuToggle}
        aria-label="Toggle menu"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={handleMobileMenuClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">Z</div>
            <div className="logo-text">
              <div className="logo-title">Zenith</div>
              <div className="logo-subtitle">Video Platform</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Overview
          </button>

          <button
            className={`nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('meetings');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Meetings
          </button>

          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analytics');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>

          <button
            className={`nav-item ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('automation');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Automation
          </button>

          <button
            className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('integrations');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            Integrations
          </button>

          <button
            className={`nav-item ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('teams');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Teams
          </button>

          <button
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('notifications');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </button>

          <button
            className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('support');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="upgrade-card">
            <p className="upgrade-title">Need more collaboration power?</p>
            <button className="btn-upgrade">Upgrade Plan</button>
          </div>
          <button 
            className="settings-btn" 
            onClick={() => {
              setActiveTab("settings");
              setIsMobileMenuOpen(false);
            }}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <div className="header-date">Thursday, November 13</div>
            <h1 className="workspace-title">Product Team Workspace</h1>
          </div>

          <div className="header-right">
            <div className="search-container">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search meetings, notes, files" className="search-input" />
            </div>

            <button className="btn-start-meeting" onClick={() => setShowStartMeetingModal(true)}>
              Start Meeting
            </button>

            <button className="icon-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button className="icon-btn" onClick={toggleTheme} title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              {isDarkMode ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button className="icon-btn notif-btn" onClick={() => setActiveTab('notifications')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="notif-badge">3</span>
            </button>

            <div className="user-menu-container">
              <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <span className="user-avatar">KE</span>
                <span className="user-name">keshavagarwal9335</span>
                <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="dropdown-avatar">KE</div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-username">keshavagarwal9335</div>
                      <div className="dropdown-email">keshavagarwal9335@gmail.com</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile & Settings
                  </button>
                  <button className="dropdown-item danger" onClick={handleSignOut}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'meetings' && <MeetingsPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'integrations' && <IntegrationsPage />}
          {activeTab === 'teams' && <TeamsPage />}
          {activeTab === 'notifications' && <NotificationsPage />}
          {activeTab === 'support' && <SupportPage />}
          {activeTab === 'settings' && <SettingsContent />}
          {activeTab !== 'overview' && activeTab !== 'meetings' && activeTab !== 'analytics' && activeTab !== 'integrations' && activeTab !== 'teams' && activeTab !== 'notifications' && activeTab !== 'support' && activeTab !== 'automation' && activeTab !== 'settings' && (
            <div className="placeholder-content">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page</h2>
              <p>Coming soon...</p>
            </div>
          )}
          {activeTab === 'automation' && (
            <div className="placeholder-content">
              <h2>Automation</h2>
              <p>Coming soon...</p>
            </div>
          )}
        </div>
      </main>

      {/* Start Meeting Modal */}
      {showStartMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowStartMeetingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start a Meeting</h2>
              <button className="modal-close" onClick={() => setShowStartMeetingModal(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code or create new"
                  className="modal-input"
                />
              </div>

              <div className="modal-options">
                <button className="option-btn" onClick={() => setRoomCode(Math.random().toString(36).substr(2, 9))}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Random Code
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowStartMeetingModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-continue" 
                onClick={handleStartMeeting}
                disabled={!roomCode.trim()}
              >
                Continue to Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;