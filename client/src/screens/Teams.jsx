import React, { useState, useEffect } from "react";
import "./Teams.css";

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamIcon, setNewTeamIcon] = useState("🎯");

  // Default teams
  const defaultTeams = [
    {
      id: 1,
      name: "Product Team",
      icon: "🎯",
      color: "#ec4899",
      members: 8,
      activeMembers: 5
    },
    {
      id: 2,
      name: "Engineering",
      icon: "⚙️",
      color: "#3b82f6",
      members: 12,
      activeMembers: 9
    },
    {
      id: 3,
      name: "Design",
      icon: "🎨",
      color: "#f59e0b",
      members: 6,
      activeMembers: 4
    }
  ];

  // Default members
  const defaultMembers = [
    {
      id: 1,
      name: "Andrea Lopez",
      role: "Product Lead",
      team: "Product Team",
      avatar: "👤",
      status: "in-call",
      email: "andrea@zenith.com"
    },
    {
      id: 2,
      name: "Leo Turner",
      role: "Engineer",
      team: "Engineering",
      avatar: "👤",
      status: "online",
      email: "leo@zenith.com"
    },
    {
      id: 3,
      name: "Grace Osei",
      role: "Research",
      team: "Design",
      avatar: "👤",
      status: "online",
      email: "grace@zenith.com"
    },
    {
      id: 4,
      name: "Jordan Kim",
      role: "Senior Engineer",
      team: "Engineering",
      avatar: "👤",
      status: "away",
      email: "jordan@zenith.com"
    },
    {
      id: 5,
      name: "Sarah Chen",
      role: "Product Manager",
      team: "Product Team",
      avatar: "👤",
      status: "online",
      email: "sarah@zenith.com"
    },
    {
      id: 6,
      name: "Alex Rivera",
      role: "Design Lead",
      team: "Design",
      avatar: "👤",
      status: "online",
      email: "alex@zenith.com"
    }
  ];

  // Available icons for teams
  const iconOptions = ["🎯", "⚙️", "🎨", "💼", "🚀", "💡", "📊", "🎮", "🔬", "📱"];

  // Load data
  useEffect(() => {
    const savedTeams = localStorage.getItem("zenith_teams");
    const savedMembers = localStorage.getItem("zenith_members");

    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      setTeams(defaultTeams);
      localStorage.setItem("zenith_teams", JSON.stringify(defaultTeams));
    }

    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    } else {
      setMembers(defaultMembers);
      localStorage.setItem("zenith_members", JSON.stringify(defaultMembers));
    }
  }, []);

  // Create team
  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      alert("Please enter a team name");
      return;
    }

    const newTeam = {
      id: Date.now(),
      name: newTeamName,
      icon: newTeamIcon,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      members: 0,
      activeMembers: 0
    };

    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem("zenith_teams", JSON.stringify(updatedTeams));

    setShowCreateModal(false);
    setNewTeamName("");
    setNewTeamIcon("🎯");
  };

  // View team (placeholder)
  const handleViewTeam = (team) => {
    alert(`View Team: ${team.name}\nThis will show team details, meetings, and members.`);
  };

  // Contact member
  const handleEmail = (member) => {
    window.location.href = `mailto:${member.email}`;
  };

  const handleCall = (member) => {
    alert(`Calling ${member.name}...\nThis will initiate a video call.`);
  };

  // Filter members
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'in-call': { text: 'In call', color: '#3b82f6' },
      'online': { text: 'Available', color: '#10b981' },
      'away': { text: 'Away', color: '#f59e0b' },
      'offline': { text: 'Offline', color: '#6b7280' }
    };
    return badges[status] || badges.offline;
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Manage your teams and collaborate effectively</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-create-team">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Team
        </button>
      </div>

      {/* Your Teams Section */}
      <div className="teams-section">
        <div className="section-header">
          <h2>Your Teams</h2>
          <p>Organize people into groups</p>
        </div>

        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-icon" style={{ background: `${team.color}15` }}>
                <span className="icon-emoji">{team.icon}</span>
              </div>
              <h3 className="team-name">{team.name}</h3>
              <div className="team-stats">
                <span className="stat-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {team.members} members
                </span>
                <span className="stat-item active">
                  {team.activeMembers} active
                </span>
              </div>
              <button onClick={() => handleViewTeam(team)} className="btn-view-team">
                View Team
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="members-section">
        <div className="section-header">
          <div>
            <h2>Team Members</h2>
            <p>All people in your workspace</p>
          </div>
          <div className="search-container">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="members-list">
          {filteredMembers.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3>No members found</h3>
              <p>Try a different search term</p>
            </div>
          ) : (
            filteredMembers.map(member => {
              const statusBadge = getStatusBadge(member.status);
              return (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <span className="avatar-emoji">{member.avatar}</span>
                    <div
                      className="status-dot"
                      style={{ background: statusBadge.color }}
                    ></div>
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                    <span className="member-team">{member.team}</span>
                  </div>
                  <div
                    className="status-badge"
                    style={{
                      background: `${statusBadge.color}15`,
                      color: statusBadge.color,
                      borderColor: `${statusBadge.color}40`
                    }}
                  >
                    {statusBadge.text}
                  </div>
                  <div className="member-actions">
                    <button
                      onClick={() => handleEmail(member)}
                      className="btn-member-action"
                      title="Send email"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleCall(member)}
                      className="btn-member-action"
                      title="Start call"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Team</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., Marketing Team"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Team Icon</label>
                <div className="icon-selector">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewTeamIcon(icon)}
                      className={`icon-option ${newTeamIcon === icon ? 'selected' : ''}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowCreateModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleCreateTeam} className="btn-create">
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;