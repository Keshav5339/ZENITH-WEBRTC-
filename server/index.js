const { Server } = require("socket.io");

const io = new Server(8000, {
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
    
    // Store user mappings
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    
    // Track room participants
    if (!roomParticipants.has(room)) {
      roomParticipants.set(room, new Set());
    }
    roomParticipants.get(room).add(socket.id);
    
    // Notify others in the room
    io.to(room).emit("user:joined", { email, id: socket.id });
    
    // Join the room
    socket.join(room);
    
    // Confirm to the user they've joined
    io.to(socket.id).emit("room:join", data);
    
    console.log(`User ${email} joined room ${room}`);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(`Call from ${socket.id} to ${to}`);
    io.to(to).emit("incomming:call", { from: socket.id, offer });
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

  // Handle ICE candidates
  socket.on("ice:candidate", ({ to, candidate }) => {
    console.log(`ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit("ice:candidate", { from: socket.id, candidate });
  });

  // Handle chat messages
  socket.on("chat:message", ({ to, message, timestamp, senderEmail }) => {
    console.log(`Chat message from ${socket.id} to ${to}`);
    io.to(to).emit("chat:message", { 
      from: socket.id, 
      message, 
      timestamp,
      senderEmail 
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket Disconnected: ${socket.id}`);
    
    // Get user info
    const email = socketidToEmailMap.get(socket.id);
    
    // Clean up mappings
    if (email) {
      emailToSocketIdMap.delete(email);
    }
    socketidToEmailMap.delete(socket.id);
    
    // Clean up room participants
    roomParticipants.forEach((participants, room) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        
        // Notify others in the room
        io.to(room).emit("user:left", { id: socket.id, email });
        
        // Remove empty rooms
        if (participants.size === 0) {
          roomParticipants.delete(room);
        }
      }
    });
  });

  // Handle explicit leave
  socket.on("leave:room", ({ room }) => {
    socket.leave(room);
    
    const email = socketidToEmailMap.get(socket.id);
    
    // Clean up room participants
    if (roomParticipants.has(room)) {
      roomParticipants.get(room).delete(socket.id);
      if (roomParticipants.get(room).size === 0) {
        roomParticipants.delete(room);
      }
    }
    
    // Notify others
    io.to(room).emit("user:left", { id: socket.id, email });
    
    console.log(`User ${email} left room ${room}`);
  });
});

console.log(`Server running on port 8000`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  io.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});