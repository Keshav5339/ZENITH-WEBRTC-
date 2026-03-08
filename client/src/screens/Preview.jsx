import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import "./Preview.css";

const PreviewPage = () => {
  const { roomCode } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [stream, setStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [devices, setDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: "",
    videoInput: "",
    audioOutput: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get available devices
  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = deviceList.filter(device => device.kind === 'audioinput');
      const videoInputs = deviceList.filter(device => device.kind === 'videoinput');
      const audioOutputs = deviceList.filter(device => device.kind === 'audiooutput');

      setDevices({
        audioInputs,
        videoInputs,
        audioOutputs
      });

      // Set default devices
      if (audioInputs.length > 0) {
        setSelectedDevices(prev => ({ ...prev, audioInput: audioInputs[0].deviceId }));
      }
      if (videoInputs.length > 0) {
        setSelectedDevices(prev => ({ ...prev, videoInput: videoInputs[0].deviceId }));
      }
      if (audioOutputs.length > 0) {
        setSelectedDevices(prev => ({ ...prev, audioOutput: audioOutputs[0].deviceId }));
      }
    } catch (err) {
      console.error("Error getting devices:", err);
      setError("Failed to get device list");
    }
  };

  // Initialize camera and mic
  const initializeMedia = async () => {
    try {
      setIsLoading(true);
      setError("");

      const constraints = {
        audio: selectedDevices.audioInput 
          ? { deviceId: { exact: selectedDevices.audioInput } }
          : true,
        video: selectedDevices.videoInput
          ? { deviceId: { exact: selectedDevices.videoInput }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("Stream obtained:", mediaStream);
      console.log("Video tracks:", mediaStream.getVideoTracks());
      console.log("Audio tracks:", mediaStream.getAudioTracks());
      
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Force play after setting srcObject
        videoRef.current.play().catch(err => {
          console.error("Play error:", err);
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError(
        err.name === "NotAllowedError"
          ? "Camera/microphone access denied. Please allow permissions."
          : "Failed to access camera/microphone."
      );
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    getDevices();
  }, []);

  // Initialize media when devices are selected
  useEffect(() => {
    if (selectedDevices.audioInput && selectedDevices.videoInput) {
      initializeMedia();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDevices.audioInput, selectedDevices.videoInput]);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  }, [stream]);

  // Toggle Audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Handle device change
  const handleDeviceChange = (type, deviceId) => {
    setSelectedDevices(prev => ({
      ...prev,
      [type]: deviceId
    }));
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      alert("Room code copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };

  // Handle join room
  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
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

  // Join meeting
  const joinMeeting = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!stream) {
      alert("Please allow camera and microphone access");
      return;
    }

    // Save display name so Room and Chat show correct "my" name
    localStorage.setItem("zenith_user_email", userName.trim());

    // Emit room:join with name as email
    socket.emit("room:join", { email: userName.trim(), room: roomCode });
  };

  return (
    <div className="preview-container">
      {/* Header */}
      <div className="preview-header">
        <div className="preview-logo">
          <div className="logo-icon">Z</div>
          <div className="logo-text">
            <div className="logo-title">Zenith</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="preview-content">
        <div className="preview-left">
          {/* Video Preview */}
          <div className="video-preview-container">
            {isLoading && (
              <div className="preview-loading">
                <div className="spinner"></div>
                <p>Loading camera...</p>
              </div>
            )}

            {error && (
              <div className="preview-error">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
                <button onClick={initializeMedia} className="retry-btn">
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`video-preview ${isVideoOff ? 'video-off' : ''}`}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play();
                    }
                  }}
                />
                {isVideoOff && (
                  <div className="video-off-overlay">
                    <div className="user-avatar-large">{userName.charAt(0).toUpperCase() || "?"}</div>
                    <p>Camera is off</p>
                  </div>
                )}
                <div className="preview-name-label">{userName || "Your Name"}</div>
              </>
            )}

            {/* Controls */}
            <div className="preview-controls">
              <button
                onClick={toggleAudio}
                className={`preview-control-btn ${isAudioMuted ? 'danger' : ''}`}
                title={isAudioMuted ? "Unmute" : "Mute"}
              >
                {isAudioMuted ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`preview-control-btn ${isVideoOff ? 'danger' : ''}`}
                title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isVideoOff ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="preview-right">
          <div className="preview-info-card">
            <h1 className="preview-title">Ready to join?</h1>
            <p className="preview-subtitle">Set up your camera and microphone</p>

            {/* Name Input */}
            <div className="preview-form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="preview-input"
              />
            </div>

            {/* Room Code Display */}
            <div className="preview-form-group">
              <label>Room Code</label>
              <div className="room-code-display">
                <input
                  type="text"
                  value={roomCode}
                  readOnly
                  className="preview-input room-code-input"
                />
                <button onClick={copyRoomCode} className="copy-code-btn" title="Copy room code">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Device Selection */}
            <div className="device-settings">
              <h3 className="device-settings-title">Device Settings</h3>

              {/* Microphone */}
              <div className="preview-form-group">
                <label>
                  <svg className="device-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Microphone
                </label>
                <select
                  value={selectedDevices.audioInput}
                  onChange={(e) => handleDeviceChange('audioInput', e.target.value)}
                  className="device-select"
                >
                  {devices.audioInputs.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera */}
              <div className="preview-form-group">
                <label>
                  <svg className="device-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Camera
                </label>
                <select
                  value={selectedDevices.videoInput}
                  onChange={(e) => handleDeviceChange('videoInput', e.target.value)}
                  className="device-select"
                >
                  {devices.videoInputs.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker */}
              <div className="preview-form-group">
                <label>
                  <svg className="device-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Speaker
                </label>
                <select
                  value={selectedDevices.audioOutput}
                  onChange={(e) => handleDeviceChange('audioOutput', e.target.value)}
                  className="device-select"
                >
                  {devices.audioOutputs.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={joinMeeting}
              disabled={!userName.trim() || !stream}
              className="join-meeting-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Join Meeting
            </button>

            {/* Info Text */}
            <p className="preview-info-text">
              🔒 Share the room code with others to invite them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;