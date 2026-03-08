import React, { useEffect, useCallback, useState, useRef } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useParams } from "react-router-dom";
import Chat from "../components/Chat";
import "./Room.css";

const RoomPage = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState("new");
  const [myEmail, setMyEmail] = useState("");
  const [remoteDisplayName, setRemoteDisplayName] = useState("");
  const mainVideoRef = useRef(null);
  const pipVideoRef = useRef(null);
  
  // UI State Management
  const [activePanel, setActivePanel] = useState(null); // 'info', 'chat', 'participants', null
  const [pendingAdmissions, setPendingAdmissions] = useState([]); // Array of {id, email}
  const [participants, setParticipants] = useState([]); // Array of {id, email, isHost}
  const [isHost, setIsHost] = useState(false);
  const [reaction, setReaction] = useState(null); // Current reaction to display
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  
  // Store original video track for screen share toggle
  const originalVideoTrackRef = useRef(null);
  const reactionTimeoutRef = useRef(null);

  // Determine if I'm the host (first person in room)
  useEffect(() => {
    if (!socket || !socket.id) return;
    if (participants.length === 0 || (participants.length === 1 && participants[0].id === socket.id)) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  }, [participants, socket]);

  // Handle user joined - check if admission needed
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    
    if (!socket || !socket.id) return;
    
    // If I'm the host and someone new joined, add to pending admissions
    if (isHost && id !== socket.id) {
      setPendingAdmissions(prev => {
        // Check if already in pending
        if (!prev.find(p => p.id === id)) {
          return [...prev, { id, email }];
        }
        return prev;
      });
      // Remember this participant's name for labeling when we call them
      setRemoteDisplayName((current) => current || email);
    } else if (!isHost && id === socket.id) {
      // I just joined, I'm waiting for admission
      setRemoteSocketId(null);
    } else {
      // Auto-admit if not using admission flow (for now, auto-admit)
      setRemoteSocketId(id);
      // Treat this joined user as the remote participant for labels/chat
      setRemoteDisplayName((current) => current || email);
    }
  }, [isHost, socket]);

  // Admit a participant
  const admitParticipant = useCallback((participantId, participantEmail) => {
    setPendingAdmissions(prev => prev.filter(p => p.id !== participantId));
    setParticipants(prev => [...prev, { id: participantId, email: participantEmail, isHost: false }]);
    setRemoteSocketId(participantId);
    setRemoteDisplayName((current) => current || participantEmail);
  }, []);

  // Deny a participant
  const denyParticipant = useCallback((participantId) => {
    setPendingAdmissions(prev => prev.filter(p => p.id !== participantId));
    // Could emit a socket event here to notify the user, but keeping it UI-only for now
  }, []);

  const handleCallUser = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      // Store original video track
      originalVideoTrackRef.current = stream.getVideoTracks()[0];
      
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      setMyStream(stream);
      setCallStarted(true);
    } catch (err) {
      console.error("Error starting call:", err);
      setError(err.name === "NotAllowedError" 
        ? "Camera/microphone access denied. Please allow permissions." 
        : "Failed to access camera/microphone.");
    }
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer, email }) => {
      try {
        setError(null);
        setRemoteSocketId(from);
        if (email) {
          setRemoteDisplayName(email);
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        
        // Store original video track
        originalVideoTrackRef.current = stream.getVideoTracks()[0];
        
        setMyStream(stream);
        console.log(`Incoming Call`, from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
        setCallStarted(true);
      } catch (err) {
        console.error("Error accepting call:", err);
        setError(err.name === "NotAllowedError" 
          ? "Camera/microphone access denied. Please allow permissions." 
          : "Failed to access camera/microphone.");
      }
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (!myStream) return;
    
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // Monitor connection state
  useEffect(() => {
    const handleConnectionStateChange = () => {
      const state = peer.getConnectionState();
      setConnectionState(state);
      console.log("Connection state:", state);
      
      if (state === "failed" || state === "disconnected") {
        setError("Connection lost. Please refresh the page.");
      }
    };

    if (peer.peer) {
      peer.peer.addEventListener("connectionstatechange", handleConnectionStateChange);
      peer.peer.addEventListener("iceconnectionstatechange", handleConnectionStateChange);
    }

    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("connectionstatechange", handleConnectionStateChange);
        peer.peer.removeEventListener("iceconnectionstatechange", handleConnectionStateChange);
      }
    };
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // Initialize: Add myself as participant
  useEffect(() => {
    if (!socket || !socket.id) return;
    const myEmailFromStorage = localStorage.getItem("zenith_user_email") || "You";
    setMyEmail(myEmailFromStorage);
    setParticipants([{ id: socket.id, email: myEmailFromStorage, isHost: true }]);
  }, [socket]);

  // Auto send streams when call is accepted
  useEffect(() => {
    if (callStarted && myStream && !isScreenSharing) {
      const timer = setTimeout(() => {
        sendStreams();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [callStarted, myStream, sendStreams, isScreenSharing]);

  // Toggle Audio
  const toggleAudio = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Screen Share
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peer.peer
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        
        if (sender) {
          const currentVideoTrack = myStream.getVideoTracks()[0];
          if (currentVideoTrack && !originalVideoTrackRef.current) {
            originalVideoTrackRef.current = currentVideoTrack;
          }
          
          await sender.replaceTrack(screenTrack);
        }
        
        setIsScreenSharing(true);
        
        screenTrack.onended = async () => {
          if (originalVideoTrackRef.current) {
            const sender = peer.peer
              .getSenders()
              .find((s) => s.track && s.track.kind === "video");
            if (sender) {
              await sender.replaceTrack(originalVideoTrackRef.current);
            }
          }
          setIsScreenSharing(false);
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        setError("Failed to share screen. Please try again.");
      }
    } else {
      if (originalVideoTrackRef.current) {
        const sender = peer.peer
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          await sender.replaceTrack(originalVideoTrackRef.current);
        }
      }
      setIsScreenSharing(false);
    }
  };

  // End Call
  const endCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    
    if (peer.peer) {
      peer.closePeer();
    }
    
    originalVideoTrackRef.current = null;
    window.location.href = "/";
  };

  // Copy Room Link
  const copyRoomLink = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink).then(() => {
      // Show toast instead of alert
      const toast = document.createElement('div');
      toast.className = 'room-toast';
      toast.textContent = 'Room link copied!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }).catch((err) => {
      console.error("Failed to copy:", err);
    });
  };

  // Panel Management
  const togglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName);
    }
  };

  // Reactions
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🎉', '🔥'];
  
  const handleReaction = (emoji) => {
    setReaction(emoji);
    setShowReactionsPicker(false);
    
    // Clear previous timeout
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
    }
    
    // Hide reaction after 3 seconds
    reactionTimeoutRef.current = setTimeout(() => {
      setReaction(null);
    }, 3000);
  };

  // Determine video layout
  const showMainVideo = remoteStream ? remoteStream : (myStream && !remoteStream ? myStream : null);
  const showPipVideo = remoteStream && myStream ? myStream : null;
  const remoteParticipantName =
    remoteDisplayName ||
    (participants.find((p) => p.id === remoteSocketId)?.email) ||
    "Remote User";

  // Attach streams to video elements
  useEffect(() => {
    if (!mainVideoRef.current) return;

    if (showMainVideo) {
      mainVideoRef.current.srcObject = showMainVideo;
      mainVideoRef.current
        .play()
        .catch((err) => console.error("Error playing main video:", err));
    } else {
      mainVideoRef.current.srcObject = null;
    }
  }, [showMainVideo]);

  useEffect(() => {
    if (!pipVideoRef.current) return;

    if (showPipVideo) {
      pipVideoRef.current.srcObject = showPipVideo;
      pipVideoRef.current
        .play()
        .catch((err) => console.error("Error playing PIP video:", err));
    } else {
      pipVideoRef.current.srcObject = null;
    }
  }, [showPipVideo]);

  // ICE candidate handling
  useEffect(() => {
    if (!socket || !peer.peer) return;

    const handleIceCandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice:candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    const handleRemoteIceCandidate = async ({ from, candidate }) => {
      try {
        await peer.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding received ICE candidate:", err);
      }
    };

    peer.peer.addEventListener("icecandidate", handleIceCandidate);
    socket.on("ice:candidate", handleRemoteIceCandidate);

    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("icecandidate", handleIceCandidate);
      }
      socket.off("ice:candidate", handleRemoteIceCandidate);
    };
  }, [socket, remoteSocketId]);

  return (
    <div className="room-container">
      {/* Error Message */}
      {error && (
        <div className="room-error-message">
          {error}
        </div>
      )}

      {/* Reaction Display */}
      {reaction && (
        <div className="reaction-display">
          <span className="reaction-emoji">{reaction}</span>
        </div>
      )}

      {/* Video Grid */}
      <div className="video-grid">
        {/* Main Video - Remote or Host */}
        {showMainVideo && (
          <div className="video-container main-video">
            <video
              ref={mainVideoRef}
              className="video-player"
              autoPlay
              playsInline
              muted={!remoteStream}
            />
            <div className="video-label">
              {remoteStream ? remoteParticipantName : "You"}
            </div>
            {remoteStream && (
              <div className="video-mute-indicator">
                {isAudioMuted && (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </div>
            )}
          </div>
        )}

        {/* PIP Video - Self view when remote is present */}
        {showPipVideo && (
          <div className="video-container pip-video">
            <video
              ref={pipVideoRef}
              className="video-player"
              autoPlay
              playsInline
              muted
            />
            <div className="video-label">
              You {isVideoOff && "(Camera Off)"} {isScreenSharing && "(Sharing Screen)"}
            </div>
            {isAudioMuted && (
              <div className="video-mute-indicator">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Waiting State */}
        {!myStream && !remoteStream && (
          <div className="waiting-state">
            <div className="waiting-content">
              <svg className="waiting-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h2>Ready to Connect</h2>
              <p>Click "Start Call" when someone joins the room</p>
            </div>
          </div>
        )}
      </div>

      {/* Admit/Deny Modal for Host */}
      {isHost && pendingAdmissions.length > 0 && (
        <div className="admit-modal-overlay">
          <div className="admit-modal">
            <div className="admit-modal-header">
              <h3>Waiting to be admitted</h3>
              <span className="admit-count">{pendingAdmissions.length}</span>
            </div>
            <div className="admit-list">
              {pendingAdmissions.map((pending) => (
                <div key={pending.id} className="admit-item">
                  <div className="admit-user-info">
                    <div className="admit-avatar">{pending.email.charAt(0).toUpperCase()}</div>
                    <div className="admit-name">{pending.email}</div>
                  </div>
                  <div className="admit-actions">
                    <button
                      onClick={() => denyParticipant(pending.id)}
                      className="admit-btn deny-btn"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => admitParticipant(pending.id, pending.email)}
                      className="admit-btn accept-btn"
                    >
                      Admit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="admit-modal-footer">
              <button
                onClick={() => {
                  pendingAdmissions.forEach(p => admitParticipant(p.id, p.email));
                }}
                className="admit-all-btn"
              >
                Admit all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls-container">
        <div className="controls-left">
          <div className="meeting-info-text">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {roomId}
          </div>
        </div>

        <div className="controls-center">
          {remoteSocketId && !callStarted && (
            <button onClick={handleCallUser} className="control-btn start-call">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Start Call
            </button>
          )}

          {myStream && (
            <>
              <button
                onClick={toggleAudio}
                className={`control-btn ${isAudioMuted ? "danger" : ""}`}
                title={isAudioMuted ? "Unmute" : "Mute"}
              >
                {isAudioMuted ? (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`control-btn ${isVideoOff ? "danger" : ""}`}
                title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isVideoOff ? (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`control-btn ${isScreenSharing ? "active" : ""}`}
                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              >
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Reactions Button */}
              <div className="reactions-container">
                <button
                  onClick={() => setShowReactionsPicker(!showReactionsPicker)}
                  className="control-btn"
                  title="Reactions"
                >
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {showReactionsPicker && (
                  <div className="reactions-picker">
                    {reactions.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleReaction(emoji)}
                        className="reaction-btn"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={endCall} className="control-btn end-call" title="End Call">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="controls-right">
          <button
            onClick={() => togglePanel('info')}
            className={`control-btn action-btn ${activePanel === 'info' ? 'active' : ''}`}
            title="Meeting information"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => togglePanel('chat')}
            className={`control-btn action-btn ${activePanel === 'chat' ? 'active' : ''}`}
            title="Chat"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button
            onClick={() => togglePanel('participants')}
            className={`control-btn action-btn ${activePanel === 'participants' ? 'active' : ''}`}
            title="People"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Side Panel */}
      {activePanel && (
        <div className={`side-panel ${activePanel}`}>
          <div className="side-panel-header">
            <h3>
              {activePanel === 'info' && 'Meeting information'}
              {activePanel === 'chat' && 'Chat'}
              {activePanel === 'participants' && 'People'}
            </h3>
            <button onClick={() => setActivePanel(null)} className="side-panel-close">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="side-panel-content">
            {activePanel === 'info' && (
              <div className="info-panel">
                <div className="info-section">
                  <label>Meeting code</label>
                  <div className="room-code-display">
                    <input
                      type="text"
                      value={roomId}
                      readOnly
                      className="room-code-input"
                    />
                    <button onClick={copyRoomLink} className="copy-code-btn">
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="info-section">
                  <label>Meeting link</label>
                  <div className="room-link-display">
                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      className="room-link-input"
                    />
                    <button onClick={copyRoomLink} className="copy-link-btn-small">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'chat' && (
              <Chat 
                socket={socket} 
                remoteSocketId={remoteSocketId} 
                myEmail={myEmail}
                isInPanel={true}
              />
            )}

            {activePanel === 'participants' && (
              <div className="participants-panel">
                <div className="participants-section">
                  <h4>In the meeting ({participants.length})</h4>
                  <div className="participants-list">
                    {participants.map((participant) => (
                      <div key={participant.id} className="participant-item">
                        <div className="participant-avatar">
                          {participant.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="participant-info">
                          <div className="participant-name">
                            {participant.email}
                            {participant.isHost && <span className="host-badge">Host</span>}
                          </div>
                        </div>
                        {socket && socket.id && participant.id === socket.id && (
                          <span className="participant-you">(You)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {pendingAdmissions.length > 0 && isHost && (
                  <div className="participants-section">
                    <h4>Waiting to be admitted ({pendingAdmissions.length})</h4>
                    <div className="participants-list">
                      {pendingAdmissions.map((pending) => (
                        <div key={pending.id} className="participant-item waiting">
                          <div className="participant-avatar">
                            {pending.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="participant-info">
                            <div className="participant-name">{pending.email}</div>
                          </div>
                          <div className="participant-actions">
                            <button
                              onClick={() => denyParticipant(pending.id)}
                              className="participant-btn deny"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => admitParticipant(pending.id, pending.email)}
                              className="participant-btn admit"
                            >
                              Admit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
