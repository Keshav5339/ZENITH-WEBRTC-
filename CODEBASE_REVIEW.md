# Codebase Review - Zenith WebRTC Video Platform

## 📋 Project Overview

**Zenith** is a modern peer-to-peer video calling application built with React and WebRTC technology. It features a comprehensive dashboard interface with video calling capabilities, chat functionality, and various management screens.

### Tech Stack
- **Frontend**: React 18.2, React Router 6.30, Socket.io Client 4.8
- **Backend**: Node.js, Socket.io 4.8, Express (implicit)
- **WebRTC**: Native WebRTC API for peer-to-peer connections
- **UI Libraries**: React Player 2.16, Recharts 3.5

---

## 🏗️ Architecture Overview

### Project Structure
```
WEBRTC/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable components (Chat)
│   │   ├── context/     # React Context (SocketProvider)
│   │   ├── screens/     # Main page components
│   │   ├── service/     # WebRTC peer connection logic
│   │   └── App.js       # Main router
│   └── package.json
│
└── server/              # Node.js signaling server
    └── index.js         # Socket.io server
```

---

## 🔌 Backend (Server)

### Server Entry Point: `server/index.js`

**Purpose**: Socket.io signaling server for WebRTC peer connection establishment

**Key Features**:
- Runs on port 8000 (configurable via env)
- CORS enabled for localhost:3000 (configurable)
- Manages room-based connections
- Handles WebRTC signaling (offers, answers, ICE candidates)
- Chat message relay

**Socket Events**:

**Client → Server**:
- `room:join` - Join a room with email and room code
- `user:call` - Initiate call with offer
- `call:accepted` - Accept call with answer
- `peer:nego:needed` - WebRTC renegotiation needed
- `peer:nego:done` - WebRTC renegotiation complete
- `ice:candidate` - ICE candidate exchange
- `chat:message` - Send chat message
- `leave:room` - Explicitly leave a room

**Server → Client**:
- `room:join` - Confirmation of room join
- `user:joined` - Notification when user joins room
- `user:left` - Notification when user leaves
- `incomming:call` - Incoming call offer
- `call:accepted` - Call acceptance confirmation
- `peer:nego:needed` - Renegotiation request
- `peer:nego:final` - Renegotiation answer
- `ice:candidate` - ICE candidate from peer
- `chat:message` - Incoming chat message

**Data Structures**:
- `emailToSocketIdMap` - Maps email → socket.id
- `socketidToEmailMap` - Maps socket.id → email
- `roomParticipants` - Maps room → Set of socket.ids

---

## 🎨 Frontend (Client)

### Entry Point: `client/src/index.js`
- Wraps app with BrowserRouter and SocketProvider
- Uses React 18 createRoot API

### Routing: `client/src/App.js`
**Routes**:
- `/` - Dashboard (main landing page)
- `/preview/:roomCode` - Preview page before joining room
- `/room/:roomId` - Active video call room

---

## 🧩 Key Components

### 1. SocketProvider (`context/SocketProvider.jsx`)
**Purpose**: Provides Socket.io connection via React Context

**Features**:
- Singleton socket instance (useMemo)
- Auto-reconnection enabled
- Configurable via `REACT_APP_SOCKET_URL` env variable
- Default: `http://localhost:8000`

**Usage**:
```jsx
const socket = useSocket(); // Get socket from context
```

---

### 2. PeerService (`service/peer.js`)
**Purpose**: WebRTC peer connection management

**Key Methods**:
- `getOffer()` - Create and set local offer
- `getAnswer(offer)` - Create answer for incoming offer
- `setLocalDescription(ans)` - Set remote answer
- `addIceCandidate(candidate)` - Add ICE candidate
- `closePeer()` - Cleanup peer connection
- `restartPeer()` - Recreate peer connection

**ICE Servers**:
- Google STUN: `stun:stun.l.google.com:19302`
- Twilio STUN: `stun:global.stun.twilio.com:3478`
- TURN servers can be added (commented out)

**Note**: Uses singleton pattern (export default new PeerService())

---

### 3. Dashboard (`screens/Dashboard.jsx`)
**Purpose**: Main application dashboard with navigation

**Features**:
- Tab-based navigation (Overview, Meetings, Analytics, Integrations, Teams, Notifications, Support)
- Dark/Light theme toggle (persisted in localStorage as `zenith_theme`)
- Start Meeting modal (generates/accepts room codes)
- User menu with profile and sign out
- Stats cards, active sessions, team presence widgets

**State Management**:
- `activeTab` - Current active tab
- `isDarkMode` - Theme preference
- `showStartMeetingModal` - Modal visibility
- `roomCode` - Room code for new meetings

**Navigation Flow**:
- Click "Start Meeting" → Modal → Enter room code → Navigate to `/preview/:roomCode`

---

### 4. Preview Page (`screens/Preview.jsx`)
**Purpose**: Pre-call setup and device configuration

**Features**:
- Camera/microphone preview
- Device selection (audio input, video input, audio output)
- Name input (used as email for socket)
- Room code display and copy
- Audio/video toggle controls
- Join meeting button

**Flow**:
1. User enters name
2. Camera/mic initialized automatically
3. User can adjust devices
4. Click "Join Meeting" → Emits `room:join` → Navigates to `/room/:roomId`

**Key State**:
- `userName` - User's display name
- `stream` - Local media stream
- `selectedDevices` - Selected audio/video devices
- `isAudioMuted`, `isVideoOff` - Control states

---

### 5. Room Page (`screens/Room.jsx`)
**Purpose**: Active video call interface

**Features**:
- Video grid (local + remote streams)
- Call controls (mute, video toggle, screen share, end call)
- Connection status indicator
- Chat component integration
- Error handling and connection state monitoring

**WebRTC Flow**:
1. User joins room → `user:joined` event received
2. When remote user joins → `handleCallUser()` creates offer
3. Remote receives `incomming:call` → Creates answer
4. Answer sent back → `call:accepted` → Streams exchanged
5. ICE candidates exchanged for NAT traversal
6. Renegotiation handled for screen sharing

**Key State**:
- `remoteSocketId` - Remote user's socket ID
- `myStream` - Local media stream
- `remoteStream` - Remote media stream
- `callStarted` - Call initiation flag
- `isScreenSharing` - Screen share state
- `connectionState` - WebRTC connection state

**Controls**:
- **Audio Toggle**: Enables/disables audio track
- **Video Toggle**: Enables/disables video track
- **Screen Share**: Replaces video track with screen capture
- **End Call**: Stops all tracks, closes peer, redirects to dashboard

**Screen Share Implementation**:
- Uses `getDisplayMedia()` API
- Replaces video track via `sender.replaceTrack()`
- Stores original track in `originalVideoTrackRef` for restoration
- Auto-restores when screen share ends

---

### 6. Chat Component (`components/Chat.jsx`)
**Purpose**: Real-time text chat during calls

**Features**:
- Toggleable chat panel
- Unread message count badge
- Auto-scroll to latest message
- Timestamp formatting
- Message bubbles (own vs remote)

**Socket Events**:
- Emits: `chat:message` with `{to, message, timestamp, senderEmail}`
- Listens: `chat:message` for incoming messages

**State**:
- `messages` - Array of message objects
- `isChatOpen` - Chat panel visibility
- `unreadCount` - Unread messages when closed

---

## 📱 Other Screen Components

### Meetings (`screens/Meetings.jsx`)
- Meeting list and management
- Schedule meetings
- Meeting history

### Analytics (`screens/Analytics.jsx`)
- Usage statistics
- Charts and graphs (using Recharts)

### Integrations (`screens/Integrations.jsx`)
- Third-party integrations (Google Calendar, Slack, Zoom, etc.)
- Integration management UI

### Teams (`screens/Teams.jsx`)
- Team management
- Team member lists

### Notifications (`screens/Notifications.jsx`)
- Notification center
- Notification settings

### Support (`screens/Support.jsx`)
- Help center
- FAQ section
- Support ticket submission

---

## 🔄 Data Flow

### Joining a Room:
1. User enters room code in Dashboard → Navigate to `/preview/:roomCode`
2. Preview page initializes camera/mic
3. User enters name and clicks "Join Meeting"
4. Client emits `room:join` with `{email: userName, room: roomCode}`
5. Server stores mappings and emits `user:joined` to room
6. Client receives `room:join` confirmation → Navigate to `/room/:roomId`

### Starting a Call:
1. User A in room → User B joins
2. User A receives `user:joined` → Sets `remoteSocketId`
3. User A clicks "Start Call" → `handleCallUser()`
4. Gets local stream → Creates offer → Emits `user:call`
5. User B receives `incomming:call` → Gets local stream → Creates answer
6. User B emits `call:accepted` with answer
7. User A receives answer → Sets remote description → Sends streams
8. Both users exchange ICE candidates → Connection established

### Screen Sharing:
1. User clicks screen share → `getDisplayMedia()` called
2. Screen track replaces video track via `replaceTrack()`
3. Original track stored in ref
4. When screen share ends → Original track restored

---

## 🎨 Styling

- CSS modules per component (e.g., `Dashboard.css`, `Room.css`)
- Dark/Light theme support via CSS classes
- Responsive design
- Glass-morphism effects mentioned in README
- Gradient backgrounds

---

## 🔐 Security & Configuration

### Environment Variables:
- `REACT_APP_SOCKET_URL` - Socket server URL (client)
- `CLIENT_URL` - CORS origin (server)
- Defaults: `localhost:8000` (server), `localhost:3000` (client)

### WebRTC Security:
- Uses STUN servers for NAT traversal
- TURN servers can be added for better connectivity
- No video/audio data stored on server (peer-to-peer)
- End-to-end encryption via WebRTC

---

## 🐛 Known Patterns & Conventions

### State Management:
- React hooks (useState, useEffect, useCallback, useRef)
- Context API for socket connection
- Local state for component-specific data
- localStorage for theme preference

### Error Handling:
- Try-catch blocks for async operations
- Error state management in components
- User-friendly error messages
- Connection state monitoring

### Cleanup:
- useEffect cleanup functions for event listeners
- Track stopping on unmount
- Peer connection cleanup
- Socket event listener removal

### Naming Conventions:
- Components: PascalCase (e.g., `Dashboard.jsx`)
- Files: Match component names
- CSS: Component-specific (e.g., `Dashboard.css`)
- Socket events: `namespace:action` format

---

## 🚀 Development Workflow

### Starting the Application:
1. **Server**: `cd server && npm start` (runs on port 8000)
2. **Client**: `cd client && npm start` (runs on port 3000)

### Key Dependencies:
- `nodemon` - Server auto-reload
- `react-scripts` - CRA build tools
- `socket.io-client` - Client WebSocket
- `react-player` - Video stream rendering

---

## 📝 Notes for Future Development

1. **ICE Candidate Handling**: Currently implemented in server but may need client-side handling
2. **Reconnection Logic**: Basic reconnection exists but could be enhanced
3. **Multiple Participants**: Currently supports 1-on-1 calls only
4. **Error Recovery**: Could add retry mechanisms for failed connections
5. **TURN Servers**: Should be configured for production (commented in peer.js)
6. **Authentication**: No user authentication currently (uses email/name as identifier)
7. **Room Persistence**: Rooms are ephemeral (cleared on disconnect)

---

## 🔍 Quick Reference

### Key Files:
- **Server**: `server/index.js`
- **Client Entry**: `client/src/index.js`
- **Router**: `client/src/App.js`
- **WebRTC Logic**: `client/src/service/peer.js`
- **Socket Context**: `client/src/context/SocketProvider.jsx`
- **Main Screens**: `client/src/screens/`

### Key Socket Events:
- Room: `room:join`, `user:joined`, `user:left`
- Call: `user:call`, `incomming:call`, `call:accepted`
- Negotiation: `peer:nego:needed`, `peer:nego:done`, `peer:nego:final`
- Chat: `chat:message`

### Key React Hooks Patterns:
- `useSocket()` - Get socket from context
- `useCallback` - Memoize event handlers
- `useRef` - Store DOM refs and mutable values
- `useEffect` - Side effects and cleanup

---

**Last Updated**: Based on current codebase structure
**Reviewer**: AI Assistant