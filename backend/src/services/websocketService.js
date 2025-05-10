// backend/src/services/websocketService.js
import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket) => {
    console.log('🟢 WebSocket connected:', socket.id);

    // Add authentication middleware if needed
    // socket.on('authenticate', (token) => { ... })

    socket.on('disconnect', () => {
      console.log('🔴 WebSocket disconnected:', socket.id);
    });

    // Handle client pings to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
};

export const emitThreatAlert = (alert) => {
  if (io) {
    io.emit('new-alert', alert);
    console.log('🚨 Emitted new alert via WebSocket');
  }
};

export const emitLogUpdate = (log) => {
  if (io) {
    io.emit('new-log', log);
    console.log('📝 Emitted new log via WebSocket');
  }
};

// Get socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
