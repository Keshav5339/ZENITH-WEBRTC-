import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: "keshavagarwal9335",
    email: "keshavagarwal9335@gmail.com",
    bio: "",
    company: "",
    location: ""
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    productUpdates: true
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: "dark",
    language: "english"
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    videoQuality: "auto",
    microphone: "default",
    camera: "default",
    autoJoinVideo: true,
    autoJoinAudio: true
  });

  // Load saved preferences from localStorage
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem("zenith_theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      setAppearance(prev => ({ ...prev, theme: savedTheme }));
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Ensure a default theme attribute is set
      document.documentElement.setAttribute("data-theme", appearance.theme);
    }

    // Load profile
    const savedProfile = localStorage.getItem("zenith_profile");
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }

    // Load notifications
    const savedNotifications = localStorage.getItem("zenith_notifications");
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    // Load language
    const savedLanguage = localStorage.getItem("zenith_language");
    if (savedLanguage) {
      setAppearance(prev => ({ ...prev, language: savedLanguage }));
    }

    // Load preferences
    const savedPreferences = localStorage.getItem("zenith_preferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Handle profile changes
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Handle profile save
  const handleProfileSave = () => {
    // Save to localStorage or API
    localStorage.setItem("zenith_profile", JSON.stringify(profileData));
    alert("Profile updated successfully!");
  };

  // Handle profile cancel
  const handleProfileCancel = () => {
    // Reset to saved values
    const saved = localStorage.getItem("zenith_profile");
    if (saved) {
      setProfileData(JSON.parse(saved));
    } else {
      setProfileData({
        fullName: "keshavagarwal9335",
        email: "keshavagarwal9335@gmail.com",
        bio: "",
        company: "",
        location: ""
      });
    }
  };

  // Handle notification toggle
  const toggleNotification = (key) => {
    setNotifications(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      // Save to localStorage
      localStorage.setItem("zenith_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  // Handle appearance theme change
  const handleThemeChange = (theme) => {
    setAppearance(prev => ({ ...prev, theme }));
    setIsDarkMode(theme === "dark");
    // Apply theme globally via data-theme attribute for CSS tokens
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zenith_theme", theme);
  };

  // Handle language change
  const handleLanguageChange = (language) => {
    setAppearance(prev => ({ ...prev, language }));
    localStorage.setItem("zenith_language", language);
  };

  // Handle preferences change
  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    localStorage.setItem("zenith_preferences", JSON.stringify({
      ...preferences,
      [field]: value
    }));
  };

  // Handle preference toggle
  const togglePreference = (key) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      localStorage.setItem("zenith_preferences", JSON.stringify(updated));
      return updated;
    });
  };

  // Security actions
  const handleChangePassword = () => {
    const newPassword = prompt("Enter new password:");
    if (newPassword) {
      alert("Password changed successfully!");
    }
  };

  const handleEnable2FA = () => {
    if (window.confirm("Do you want to enable Two-Factor Authentication?")) {
      alert("2FA setup instructions will be sent to your email!");
    }
  };

  const handleViewSessions = () => {
    alert("Active Sessions:\n\n- Chrome on Windows (Current)\n- Firefox on Windows\n- Safari on Mac");
  };

  const handleExportData = () => {
    alert("Your data export will be sent to your email within 24 hours.");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (window.confirm("This will permanently delete all your data. Type 'DELETE' to confirm:")) {
        alert("Account deletion request submitted. You will receive a confirmation email.");
      }
    }
  };

  // Profile photo upload
  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          localStorage.setItem("zenith_profile_photo", event.target.result);
          alert("Profile photo updated!");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Render Profile Section
  const renderProfile = () => (
    <div className="settings-content-section">
      <div className="settings-section-header">
        <h2>Profile Information</h2>
        <p>Update your personal information</p>
      </div>

      <div className="settings-form">
        {/* Profile Picture */}
        <div className="form-group">
          <label>Profile Picture</label>
          <div className="profile-picture-section">
            <div className="profile-avatar-large">
              {localStorage.getItem("zenith_profile_photo") ? (
                <img 
                  src={localStorage.getItem("zenith_profile_photo")} 
                  alt="Profile" 
                  className="profile-photo"
                />
              ) : (
                <span>KE</span>
              )}
            </div>
            <button className="btn-upload-photo" onClick={handlePhotoUpload}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Photo
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profileData.fullName}
            onChange={(e) => handleProfileChange("fullName", e.target.value)}
            className="settings-input"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleProfileChange("email", e.target.value)}
            className="settings-input"
            placeholder="Enter your email"
          />
        </div>

        {/* Bio */}
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange("bio", e.target.value)}
            className="settings-textarea"
            placeholder="Tell us about yourself"
            rows="4"
          />
        </div>

        {/* Company */}
        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            value={profileData.company}
            onChange={(e) => handleProfileChange("company", e.target.value)}
            className="settings-input"
            placeholder="Your company"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => handleProfileChange("location", e.target.value)}
            className="settings-input"
            placeholder="City, Country"
          />
        </div>

        {/* Action Buttons */}
        <div className="settings-form-actions">
          <button className="btn-save" onClick={handleProfileSave}>
            Save Changes
          </button>
          <button className="btn-cancel" onClick={handleProfileCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Render Notifications Section
  const renderNotifications = () => (
    <div className="settings-content-section">
      <div className="settings-section-header">
        <h2>Notification Preferences</h2>
        <p>Choose how you want to be notified</p>
      </div>

      <div className="settings-list">
        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Email Notifications</h3>
            <p>Receive notifications via email</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={() => toggleNotification("emailNotifications")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Push Notifications</h3>
            <p>Receive browser push notifications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={() => toggleNotification("pushNotifications")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Meeting Reminders</h3>
            <p>Get notified before meetings start</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.meetingReminders}
              onChange={() => toggleNotification("meetingReminders")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Product Updates</h3>
            <p>Receive updates about new features</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.productUpdates}
              onChange={() => toggleNotification("productUpdates")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render Security Section
  const renderSecurity = () => (
    <div className="settings-content-section">
      <div className="settings-section-header">
        <h2>Security Settings</h2>
        <p>Manage your account security</p>
      </div>

      <div className="settings-list">
        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Change Password</h3>
            <p>Update your password to keep your account secure</p>
          </div>
          <button className="btn-secondary" onClick={handleChangePassword}>
            Change Password
          </button>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security to your account</p>
          </div>
          <button className="btn-secondary" onClick={handleEnable2FA}>
            Enable 2FA
          </button>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Active Sessions</h3>
            <p>Manage devices where you're signed in</p>
          </div>
          <button className="btn-secondary" onClick={handleViewSessions}>
            View Sessions
          </button>
        </div>
      </div>

      <div className="danger-zone">
        <h3 className="danger-zone-title">Danger Zone</h3>
        <div className="settings-list">
          <div className="settings-list-item">
            <div className="list-item-content">
              <h3>Export Data</h3>
              <p>Download a copy of your account data</p>
            </div>
            <button className="btn-secondary" onClick={handleExportData}>
              Export Data
            </button>
          </div>

          <div className="settings-list-item">
            <div className="list-item-content">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="btn-danger" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Appearance Section
  const renderAppearance = () => (
    <div className="settings-content-section">
      <div className="settings-section-header">
        <h2>Appearance</h2>
        <p>Customize how Zenith looks</p>
      </div>

      <div className="settings-form">
        <div className="form-group">
          <label>Theme</label>
          <p className="form-description">Choose your preferred theme</p>
          <div className="theme-selector">
            <button
              className={`theme-option ${appearance.theme === "dark" ? "active" : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              Dark
            </button>
            <button
              className={`theme-option ${appearance.theme === "light" ? "active" : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              Light
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Language</label>
          <p className="form-description">Select your preferred language</p>
          <select
            value={appearance.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="settings-select"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="chinese">Chinese</option>
            <option value="japanese">Japanese</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Render Preferences Section
  const renderPreferences = () => (
    <div className="settings-content-section">
      <div className="settings-section-header">
        <h2>Preferences</h2>
        <p>Customize your experience</p>
      </div>

      <div className="settings-form">
        <div className="form-group">
          <label>Default Video Quality</label>
          <p className="form-description">Set your preferred video quality for calls</p>
          <select
            value={preferences.videoQuality}
            onChange={(e) => handlePreferenceChange("videoQuality", e.target.value)}
            className="settings-select"
          >
            <option value="auto">Auto</option>
            <option value="low">Low (360p)</option>
            <option value="medium">Medium (720p)</option>
            <option value="high">High (1080p)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Microphone Input</label>
          <p className="form-description">Select your default microphone</p>
          <select
            value={preferences.microphone}
            onChange={(e) => handlePreferenceChange("microphone", e.target.value)}
            className="settings-select"
          >
            <option value="default">Default</option>
            <option value="mic1">Microphone 1</option>
            <option value="mic2">Microphone 2</option>
          </select>
        </div>

        <div className="form-group">
          <label>Camera</label>
          <p className="form-description">Select your default camera</p>
          <select
            value={preferences.camera}
            onChange={(e) => handlePreferenceChange("camera", e.target.value)}
            className="settings-select"
          >
            <option value="default">Default</option>
            <option value="camera1">Camera 1</option>
            <option value="camera2">Camera 2</option>
          </select>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Auto-join with video</h3>
            <p>Automatically enable video when joining calls</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.autoJoinVideo}
              onChange={() => togglePreference("autoJoinVideo")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-list-item">
          <div className="list-item-content">
            <h3>Auto-join with audio</h3>
            <p>Automatically enable audio when joining calls</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.autoJoinAudio}
              onChange={() => togglePreference("autoJoinAudio")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page-wrapper">
      {/* Header - Matching Dashboard */}
      <header className="settings-header">
        <div className="settings-header-left">
          <button className="back-to-dashboard" onClick={() => navigate("/")}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <div className="settings-header-center">
          <h1 className="settings-page-title">Settings</h1>
          <p className="settings-page-subtitle">Manage your account settings and preferences</p>
        </div>
        <div className="settings-header-right"></div>
      </header>

      <div className="settings-container">
        <div className="settings-sidebar">
        <h2 className="settings-title">Settings</h2>
        <nav className="settings-nav">
          <button
            className={`settings-nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>

          <button
            className={`settings-nav-item ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection("notifications")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </button>

          <button
            className={`settings-nav-item ${activeSection === "security" ? "active" : ""}`}
            onClick={() => setActiveSection("security")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security
          </button>

          <button
            className={`settings-nav-item ${activeSection === "appearance" ? "active" : ""}`}
            onClick={() => setActiveSection("appearance")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Appearance
          </button>

          <button
            className={`settings-nav-item ${activeSection === "preferences" ? "active" : ""}`}
            onClick={() => setActiveSection("preferences")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preferences
          </button>
        </nav>
      </div>

      <div className="settings-content">
        {activeSection === "profile" && renderProfile()}
        {activeSection === "notifications" && renderNotifications()}
        {activeSection === "security" && renderSecurity()}
        {activeSection === "appearance" && renderAppearance()}
        {activeSection === "preferences" && renderPreferences()}
      </div>
      </div>
    </div>
  );
};

export default Settings;
