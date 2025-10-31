import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import "./Lobby.css";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!email || !room) return;
      setIsJoining(true);
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="lobby-container">
      <div className="lobby-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="lobby-content">
        <div className="lobby-header">
          <div className="logo-circle">
            <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="lobby-title">SecureCall</h1>
          <p className="lobby-subtitle">Peer-to-peer encrypted video calls</p>
        </div>

        <div className="lobby-card">
          <h2 className="card-title">Join a Room</h2>
          
          <form onSubmit={handleSubmitForm} className="lobby-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="room" className="form-label">
                Room Code
              </label>
              <input
                type="text"
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room code"
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isJoining || !email || !room}
              className="join-button"
            >
              {isJoining ? (
                <span className="button-content">
                  <span className="spinner"></span>
                  Joining...
                </span>
              ) : (
                "Join Room"
              )}
            </button>
          </form>

          <div className="card-footer">
            <p className="security-text">
              🔒 End-to-end encrypted • No data stored
            </p>
          </div>
        </div>

        <div className="lobby-footer">
          <p className="footer-text">
            Share the room code with others to start calling
          </p>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;