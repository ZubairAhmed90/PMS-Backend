const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedisClient } = require('./config/redis');

function setupSocketIO(httpServer) {
  const allowedOrigins = (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.includes('*') ? true : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Set up Redis adapter for multi-replica broadcasting (optional)
  if (process.env.REDIS_URL) {
    try {
      const pubClient = getRedisClient();
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.io] Redis adapter configured for multi-replica');
    } catch (err) {
      console.warn('[Socket.io] Redis adapter not available — single-replica mode:', err.message);
    }
  } else {
    console.log('[Socket.io] No REDIS_URL — running in single-replica mode');
  }

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join patient-specific room
    socket.on('join:patient', (patientId) => {
      socket.join(`patient:${patientId}`);
      console.log(`[Socket.io] ${socket.id} joined patient:${patientId}`);
    });

    // Join hospital room
    socket.on('join:hospital', (organizationId) => {
      socket.join(`hospital:${organizationId}`);
      console.log(`[Socket.io] ${socket.id} joined hospital:${organizationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit a vitals update to a patient room and relevant hospital rooms.
 */
function emitVitals(io, patientId, data) {
  io.to(`patient:${patientId}`).emit('vitals:update', data);
}

/**
 * Emit an alert to a patient room and hospital room.
 */
function emitAlert(io, patientId, organizationId, data) {
  io.to(`patient:${patientId}`).emit('alert:new', data);
  if (organizationId) {
    io.to(`hospital:${organizationId}`).emit('alert:new', data);
  }
}

/**
 * Emit risk score update to hospital room.
 */
function emitRiskUpdate(io, organizationId, data) {
  if (organizationId) {
    io.to(`hospital:${organizationId}`).emit('risk:update', data);
  }
}

module.exports = { setupSocketIO, emitVitals, emitAlert, emitRiskUpdate };
