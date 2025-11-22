import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Chat from "../components/Chat";
import "./Room.css";

const RoomPage = () => {
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
  
  // Store original video track for screen share toggle
  const originalVideoTrackRef = useRef(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    setMyEmail(email); // Store my email for chat
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
    async ({ from, offer }) => {
      try {
        setError(null);
        setRemoteSocketId(from);
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

  // Screen Share - FIXED VERSION
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
          // Store current video track before replacing
          const currentVideoTrack = myStream.getVideoTracks()[0];
          if (currentVideoTrack && !originalVideoTrackRef.current) {
            originalVideoTrackRef.current = currentVideoTrack;
          }
          
          await sender.replaceTrack(screenTrack);
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share stop
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
      // Stop screen sharing manually
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

  // End Call - IMPROVED CLEANUP
  const endCall = () => {
    // Stop all tracks
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    
    // Close peer connection
    if (peer.peer) {
      peer.closePeer();
    }
    
    // Clear refs
    originalVideoTrackRef.current = null;
    
    // Redirect to lobby
    window.location.href = "/";
  };

  // Copy Room Link
  const copyRoomLink = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink).then(() => {
      alert("Room link copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link. Please copy manually from address bar.");
    });
  };

  return (
    <div className="room-container">
      {/* Header */}
      <div className="room-header">
        <div className="room-info">
          <h1 className="room-title">Video Call Room</h1>
          <div className="connection-status">
            <span className={`status-indicator ${remoteSocketId ? "connected" : "waiting"}`}></span>
            <span className="status-text">
              {remoteSocketId ? "Connected" : "Waiting for others..."}
            </span>
          </div>
        </div>
        <button onClick={copyRoomLink} className="copy-link-btn">
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Link
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Video Grid */}
      <div className="video-grid">
        {/* Remote Stream */}
        {remoteStream && (
          <div className="video-container main-video">
            <ReactPlayer
              playing
              height="100%"
              width="100%"
              url={remoteStream}
              className="video-player"
            />
            <div className="video-label">Remote User</div>
          </div>
        )}

        {/* My Stream */}
        {myStream && (
          <div className={`video-container ${remoteStream ? "pip-video" : "main-video"}`}>
            <ReactPlayer
              playing
              muted
              height="100%"
              width="100%"
              url={myStream}
              className="video-player"
            />
            <div className="video-label">
              You {isVideoOff && "(Camera Off)"} {isScreenSharing && "(Sharing Screen)"}
            </div>
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

      {/* Controls */}
      <div className="controls-container">
        <div className="controls">
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

              <button onClick={endCall} className="control-btn end-call" title="End Call">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chat Component */}
      <Chat socket={socket} remoteSocketId={remoteSocketId} myEmail={myEmail} />
    </div>
  );
};

export default RoomPage;