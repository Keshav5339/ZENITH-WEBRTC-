import React, { useState, useEffect } from "react";
import "./Integrations.css";

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // All available integrations
  const allIntegrations = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync meetings with your calendar",
      category: "Productivity",
      icon: "📅",
      color: "#4285F4",
      features: ["Auto-sync meetings", "Calendar invites", "Reminders"]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get meeting notifications in Slack",
      category: "Communication",
      icon: "💬",
      color: "#4A154B",
      features: ["Meeting notifications", "Channel updates", "Direct messages"]
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Import meetings from Zoom",
      category: "Video Conferencing",
      icon: "📹",
      color: "#2D8CFF",
      features: ["Import meetings", "Sync schedules", "Recording access"]
    },
    {
      id: "microsoft-teams",
      name: "Microsoft Teams",
      description: "Connect with Teams workspace",
      category: "Communication",
      icon: "👥",
      color: "#6264A7",
      features: ["Team collaboration", "Meeting sync", "Chat integration"]
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Store recordings and files",
      category: "Storage",
      icon: "📁",
      color: "#34A853",
      features: ["Auto-save recordings", "File sharing", "Cloud backup"]
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Cloud storage integration",
      category: "Storage",
      icon: "📦",
      color: "#0061FF",
      features: ["File sync", "Shared folders", "Version history"]
    },
    {
      id: "trello",
      name: "Trello",
      description: "Project management integration",
      category: "Productivity",
      icon: "📋",
      color: "#0079BF",
      features: ["Create cards", "Meeting notes", "Task tracking"]
    },
    {
      id: "notion",
      name: "Notion",
      description: "Note-taking and docs",
      category: "Productivity",
      icon: "📝",
      color: "#000000",
      features: ["Meeting notes", "Documentation", "Wiki creation"]
    },
    {
      id: "discord",
      name: "Discord",
      description: "Community chat integration",
      category: "Communication",
      icon: "🎮",
      color: "#5865F2",
      features: ["Server notifications", "Voice channels", "Community alerts"]
    },
    {
      id: "github",
      name: "GitHub",
      description: "Developer collaboration",
      category: "Development",
      icon: "🐙",
      color: "#181717",
      features: ["Issue tracking", "PR notifications", "Code reviews"]
    },
    {
      id: "jira",
      name: "Jira",
      description: "Issue tracking and project management",
      category: "Development",
      icon: "🎯",
      color: "#0052CC",
      features: ["Issue tracking", "Sprint planning", "Workflow automation"]
    },
    {
      id: "asana",
      name: "Asana",
      description: "Task and project management",
      category: "Productivity",
      icon: "✅",
      color: "#F06A6A",
      features: ["Task management", "Project tracking", "Team collaboration"]
    }
  ];

  // Load integrations from localStorage
  useEffect(() => {
    const savedIntegrations = localStorage.getItem("zenith_integrations");
    if (savedIntegrations) {
      setIntegrations(JSON.parse(savedIntegrations));
    } else {
      // Set default connected integrations
      const defaultConnected = ["google-calendar", "slack"];
      setIntegrations(defaultConnected);
      localStorage.setItem("zenith_integrations", JSON.stringify(defaultConnected));
    }
  }, []);

  // Save integrations to localStorage
  const saveIntegrations = (updatedIntegrations) => {
    localStorage.setItem("zenith_integrations", JSON.stringify(updatedIntegrations));
    setIntegrations(updatedIntegrations);
  };

  // Check if integration is connected
  const isConnected = (integrationId) => {
    return integrations.includes(integrationId);
  };

  // Handle connect integration
  const handleConnect = (integration) => {
    const updatedIntegrations = [...integrations, integration.id];
    saveIntegrations(updatedIntegrations);
    
    // Show success message
    alert(`✅ Successfully connected to ${integration.name}!`);
  };

  // Handle disconnect integration
  const handleDisconnect = (integration) => {
    if (window.confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      const updatedIntegrations = integrations.filter(id => id !== integration.id);
      saveIntegrations(updatedIntegrations);
      setShowManageModal(false);
    }
  };

  // Open manage modal
  const openManageModal = (integration) => {
    setSelectedIntegration(integration);
    setShowManageModal(true);
  };

  // Handle browse more
  const handleBrowseMore = () => {
    alert("Browse More feature coming soon! We're constantly adding new integrations.");
  };

  // Group integrations by category
  const categories = [...new Set(allIntegrations.map(i => i.category))];

  return (
    <div className="integrations-page">
      <div className="integrations-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect your favorite tools and services</p>
        </div>
        <button onClick={handleBrowseMore} className="btn-browse-more">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Browse More
        </button>
      </div>

      {/* Integration Stats */}
      <div className="integration-stats">
        <div className="stat-item">
          <span className="stat-number">{integrations.length}</span>
          <span className="stat-label">Connected</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{allIntegrations.length}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      {/* Integrations by Category */}
      {categories.map(category => {
        const categoryIntegrations = allIntegrations.filter(i => i.category === category);
        
        return (
          <div key={category} className="category-section">
            <h2 className="category-title">{category}</h2>
            
            <div className="integrations-grid">
              {categoryIntegrations.map(integration => {
                const connected = isConnected(integration.id);
                
                return (
                  <div key={integration.id} className="integration-card">
                    <div className="integration-header-section">
                      <div 
                        className="integration-icon"
                        style={{ background: `${integration.color}15` }}
                      >
                        <span className="icon-emoji">{integration.icon}</span>
                      </div>
                      {connected && (
                        <div className="connected-badge">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Connected
                        </div>
                      )}
                    </div>

                    <div className="integration-content">
                      <h3 className="integration-name">{integration.name}</h3>
                      <p className="integration-description">{integration.description}</p>
                      
                      <div className="integration-features">
                        {integration.features.map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="integration-footer">
                      {connected ? (
                        <button
                          onClick={() => openManageModal(integration)}
                          className="btn-manage"
                        >
                          Manage
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration)}
                          className="btn-connect"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Manage Modal */}
      {showManageModal && selectedIntegration && (
        <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="modal-content manage-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <div 
                  className="modal-integration-icon"
                  style={{ background: `${selectedIntegration.color}15` }}
                >
                  <span className="icon-emoji">{selectedIntegration.icon}</span>
                </div>
                <div>
                  <h2>{selectedIntegration.name}</h2>
                  <p className="modal-subtitle">{selectedIntegration.category}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowManageModal(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="integration-status-section">
                <div className="status-row">
                  <span className="status-label">Status</span>
                  <div className="status-badge-large connected">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Connected
                  </div>
                </div>
              </div>

              <div className="features-section">
                <h3>Features</h3>
                <ul className="features-list">
                  {selectedIntegration.features.map((feature, index) => (
                    <li key={index}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="settings-section">
                <h3>Settings</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Enable notifications</span>
                    <span className="setting-description">Get notified about important updates</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Auto-sync</span>
                    <span className="setting-description">Automatically sync data</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => handleDisconnect(selectedIntegration)}
                className="btn-disconnect"
              >
                Disconnect
              </button>
              <button
                onClick={() => setShowManageModal(false)}
                className="btn-done"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;