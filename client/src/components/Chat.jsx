import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";

const Chat = ({ socket, remoteSocketId, myEmail }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = ({ from, message, timestamp, senderEmail }) => {
      const newMsg = {
        id: Date.now(),
        text: message,
        sender: senderEmail || "Remote User",
        timestamp: timestamp || new Date().toISOString(),
        isOwn: false,
      };
      
      setMessages((prev) => [...prev, newMsg]);
      
      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("chat:message", handleReceiveMessage);

    return () => {
      socket.off("chat:message", handleReceiveMessage);
    };
  }, [socket, isChatOpen]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !remoteSocketId) return;

    const timestamp = new Date().toISOString();
    
    // Add to local state
    const newMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: "You",
      timestamp,
      isOwn: true,
    };
    
    setMessages((prev) => [...prev, newMsg]);

    // Send via socket
    socket.emit("chat:message", {
      to: remoteSocketId,
      message: newMessage.trim(),
      timestamp,
      senderEmail: myEmail,
    });

    // Clear input
    setNewMessage("");
    inputRef.current?.focus();
  };

  // Toggle chat
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`chat-toggle-btn ${isChatOpen ? "active" : ""}`}
        title={isChatOpen ? "Close Chat" : "Open Chat"}
      >
        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="chat-panel">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-title">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3>Chat</h3>
            </div>
            <button onClick={toggleChat} className="chat-close-btn" title="Close">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet</p>
                <span>Send a message to start the conversation</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.isOwn ? "own-message" : "remote-message"}`}
                >
                  <div className="message-bubble">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
              disabled={!remoteSocketId}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !remoteSocketId}
              className="chat-send-btn"
              title="Send"
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          {!remoteSocketId && (
            <div className="chat-disabled-notice">
              Waiting for someone to join...
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;