import React, { useState } from "react";
import "./Support.css";

const SupportPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "technical",
    description: ""
  });

  // Help topics
  const helpTopics = [
    {
      id: 1,
      title: "Getting Started",
      description: "Learn the basics of using Zenith",
      icon: "📖",
      color: "#3b82f6"
    },
    {
      id: 2,
      title: "Video Calls",
      description: "Troubleshoot call issues",
      icon: "🎥",
      color: "#8b5cf6"
    },
    {
      id: 3,
      title: "Account Settings",
      description: "Manage your account and preferences",
      icon: "⚙️",
      color: "#10b981"
    },
    {
      id: 4,
      title: "Billing",
      description: "Questions about plans and payments",
      icon: "💳",
      color: "#f59e0b"
    }
  ];

  // FAQs
  const faqs = [
    {
      id: 1,
      question: "How do I schedule a meeting?",
      answer: 'Click the "Schedule Meeting" button in the header or go to the Meetings page to create a new meeting.'
    },
    {
      id: 2,
      question: "Can I record meetings?",
      answer: "Yes, you can enable recording in the meeting settings or set up automatic recording in Automation."
    },
    {
      id: 3,
      question: "How many participants can join?",
      answer: "The number of participants depends on your plan. Free plan supports up to 5 participants, Pro plan up to 50, and Enterprise has unlimited participants."
    },
    {
      id: 4,
      question: "How do I share my screen?",
      answer: "During a meeting, click the screen share button in the bottom controls. You can share your entire screen or a specific window."
    },
    {
      id: 5,
      question: "Can I integrate with other tools?",
      answer: "Yes! Visit the Integrations page to connect with Google Calendar, Slack, Zoom, Microsoft Teams, and many other services."
    },
    {
      id: 6,
      question: "Is my data secure?",
      answer: "Absolutely. All calls are end-to-end encrypted, and we don't store any meeting content on our servers."
    },
    {
      id: 7,
      question: "How do I invite team members?",
      answer: "Go to the Teams page and click 'Create Team' or use the 'Invite' button to send invitations via email."
    },
    {
      id: 8,
      question: "What browsers are supported?",
      answer: "Zenith works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend Chrome for the best experience."
    }
  ];

  // Toggle FAQ
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Handle ticket form
  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      alert("Please fill in all fields");
      return;
    }
    alert("Support ticket submitted! We'll get back to you within 24 hours.");
    setShowTicketModal(false);
    setTicketForm({ subject: "", category: "technical", description: "" });
  };

  // Contact support
  const handleContactSupport = () => {
    setShowTicketModal(true);
  };

  const handleLearnMore = (topic) => {
    alert(`Opening help documentation for: ${topic.title}\n\nThis will redirect to detailed guides and tutorials.`);
  };

  return (
    <div className="support-page">
      <div className="support-header">
        <div>
          <h1 className="page-title">Support</h1>
          <p className="page-subtitle">Get help and contact our support team</p>
        </div>
        <button onClick={handleContactSupport} className="btn-contact-support">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Contact Support
        </button>
      </div>

      {/* Quick Contact Methods */}
      <div className="contact-methods">
        <div className="contact-item">
          <div className="contact-icon">📧</div>
          <div className="contact-info">
            <h3>Email Us</h3>
            <p>support@zenith.com</p>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">💬</div>
          <div className="contact-info">
            <h3>Live Chat</h3>
            <p>Available 24/7</p>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">📞</div>
          <div className="contact-info">
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">🌐</div>
          <div className="contact-info">
            <h3>Community</h3>
            <p>Join our forum</p>
          </div>
        </div>
      </div>

      {/* Help Topics */}
      <div className="help-topics-section">
        <h2 className="section-title">Help Topics</h2>
        <div className="help-topics-grid">
          {helpTopics.map(topic => (
            <div key={topic.id} className="help-topic-card">
              <div className="topic-icon" style={{ background: `${topic.color}15` }}>
                <span className="icon-emoji">{topic.icon}</span>
              </div>
              <h3 className="topic-title">{topic.title}</h3>
              <p className="topic-description">{topic.description}</p>
              <button 
                onClick={() => handleLearnMore(topic)} 
                className="btn-learn-more"
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Quick answers to common questions</p>

        <div className="faq-list">
          {faqs.map(faq => (
            <div key={faq.id} className={`faq-item ${expandedFaq === faq.id ? 'expanded' : ''}`}>
              <button 
                className="faq-question"
                onClick={() => toggleFaq(faq.id)}
              >
                <span>{faq.question}</span>
                <svg 
                  className={`faq-icon ${expandedFaq === faq.id ? 'rotated' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {expandedFaq === faq.id && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="resources-section">
        <h2 className="section-title">Additional Resources</h2>
        <div className="resources-grid">
          <div className="resource-card">
            <svg className="resource-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3>Documentation</h3>
            <p>Complete guides and API docs</p>
            <button className="btn-resource">View Docs</button>
          </div>

          <div className="resource-card">
            <svg className="resource-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Video Tutorials</h3>
            <p>Step-by-step video guides</p>
            <button className="btn-resource">Watch Videos</button>
          </div>

          <div className="resource-card">
            <svg className="resource-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3>Release Notes</h3>
            <p>Latest features and updates</p>
            <button className="btn-resource">Read More</button>
          </div>
        </div>
      </div>

      {/* Submit Ticket Modal */}
      {showTicketModal && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Support Ticket</h2>
              <button className="modal-close" onClick={() => setShowTicketModal(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmitTicket}>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={ticketForm.subject}
                    onChange={handleTicketChange}
                    placeholder="Brief description of your issue"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={ticketForm.category}
                    onChange={handleTicketChange}
                    className="form-input"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Help</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={ticketForm.description}
                    onChange={handleTicketChange}
                    placeholder="Please provide details about your issue..."
                    className="form-textarea"
                    rows="5"
                    required
                  />
                </div>

                <div className="ticket-info">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>We typically respond within 24 hours. For urgent issues, please use live chat.</p>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowTicketModal(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-ticket">
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;