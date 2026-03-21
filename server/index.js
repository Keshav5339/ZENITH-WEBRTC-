const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer();

// Attach Socket.IO to server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomParticipants = new Map(); // Track room participants

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", (data) => {
    const { email, room } = data;
    
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    
    if (!roomParticipants.has(room)) {
      roomParticipants.set(room, new Set());
    }
    roomParticipants.get(room).add(socket.id);
    
    io.to(room).emit("user:joined", { email, id: socket.id });
    
    socket.join(room);
    
    io.to(socket.id).emit("room:join", data);
    
    console.log(`User ${email} joined room ${room}`);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(`Call from ${socket.id} to ${to}`);
    const email = socketidToEmailMap.get(socket.id);
    io.to(to).emit("incomming:call", { from: socket.id, offer, email });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`Call accepted by ${socket.id} to ${to}`);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log(`Negotiation needed from ${socket.id} to ${to}`);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log(`Negotiation done from ${socket.id} to ${to}`);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("ice:candidate", ({ to, candidate }) => {
    console.log(`ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit("ice:candidate", { from: socket.id, candidate });
  });

  socket.on("chat:message", ({ to, message, timestamp, senderEmail }) => {
    console.log(`Chat message from ${socket.id} to ${to}`);
    const senderName = socketidToEmailMap.get(socket.id) || senderEmail || "Remote User";
    io.to(to).emit("chat:message", { 
      from: socket.id, 
      message, 
      timestamp,
      senderEmail: senderName 
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket Disconnected: ${socket.id}`);
    
    const email = socketidToEmailMap.get(socket.id);
    
    if (email) {
      emailToSocketIdMap.delete(email);
    }
    socketidToEmailMap.delete(socket.id);
    
    roomParticipants.forEach((participants, room) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        
        io.to(room).emit("user:left", { id: socket.id, email });
        
        if (participants.size === 0) {
          roomParticipants.delete(room);
        }
      }
    });
  });

  socket.on("leave:room", ({ room }) => {
    socket.leave(room);
    
    const email = socketidToEmailMap.get(socket.id);
    
    if (roomParticipants.has(room)) {
      roomParticipants.get(room).delete(socket.id);
      if (roomParticipants.get(room).size === 0) {
        roomParticipants.delete(room);
      }
    }
    
    io.to(room).emit("user:left", { id: socket.id, email });
    
    console.log(`User ${email} left room ${room}`);
  });
});

// ✅ Start server using dynamic PORT
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  io.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});