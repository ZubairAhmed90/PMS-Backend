// ═══════════════════════════════════════════════════════════
// PMS Caregiver Backend — cPanel Passenger Entry Point
// All routes, health API, DB sync, and Socket.io bootstrap here.
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

// --- Config ---
// cPanel Passenger sets PORT automatically — no hardcoded fallback
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SYNC_DB = process.argv.includes('--sync') || NODE_ENV !== 'production';

// ──────────────────────────────────────────────
//  Express App
// ──────────────────────────────────────────────
const app = express();

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────
//  Health Check
// ──────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const { sequelize } = require('./src/models');
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    db: dbStatus,
    redis: process.env.REDIS_URL ? 'configured' : 'not configured',
    env: NODE_ENV,
  });
});

// ──────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patients');
const vitalsRoutes = require('./src/routes/vitals');
const alertRoutes = require('./src/routes/alerts');
const hospitalRoutes = require('./src/routes/hospitals');
const departmentRoutes = require('./src/routes/departments');
const roomRoutes = require('./src/routes/rooms');
const staffRoutes = require('./src/routes/staff');
const appointmentRoutes = require('./src/routes/appointments');
const prescriptionRoutes = require('./src/routes/prescriptions');
const labResultRoutes = require('./src/routes/labResults');
const clinicalNoteRoutes = require('./src/routes/clinicalNotes');
const invoiceRoutes = require('./src/routes/invoices');

// Auth
app.use('/auth', authRoutes);

// Core monitoring
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/vitals', vitalsRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);

// FHIR integration
app.use('/fhir', hospitalRoutes);

// PMS management
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/invoices', invoiceRoutes);

// Patient-nested sub-resources
app.use('/api/v1/patients', prescriptionRoutes);
app.use('/api/v1/patients', labResultRoutes);
app.use('/api/v1/patients', clinicalNoteRoutes);

// ──────────────────────────────────────────────
//  404 handler
// ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ──────────────────────────────────────────────
//  Error handler (must be last)
// ──────────────────────────────────────────────
const { errorHandler } = require('./src/middleware/errorHandler');
app.use(errorHandler);

// ──────────────────────────────────────────────
//  HTTP Server + Socket.io
// ──────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Optional Redis adapter for multi-replica broadcasting
if (process.env.REDIS_URL) {
  try {
    const { getRedisClient } = require('./src/config/redis');
    const pubClient = getRedisClient();
    if (pubClient) {
      const subClient = pubClient.duplicate();
      const { createAdapter } = require('@socket.io/redis-adapter');
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.io] Redis adapter active');
    }
  } catch (err) {
    console.warn('[Socket.io] Redis adapter skipped:', err.message);
  }
} else {
  console.log('[Socket.io] Single-replica mode (no REDIS_URL)');
}

io.on('connection', (socket) => {
  console.log(`[Socket.io] Connected: ${socket.id}`);
  socket.on('join:patient', (id) => {
    socket.join(`patient:${id}`);
  });
  socket.on('join:hospital', (id) => {
    socket.join(`hospital:${id}`);
  });
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// ──────────────────────────────────────────────
//  Start Server
// ──────────────────────────────────────────────
async function start() {
  try {
    const { sequelize } = require('./src/models');

    // Connect to MySQL
    await sequelize.authenticate();
    console.log(`[DB] MySQL connected (${process.env.DB_HOST})`);

    // Sync models — creates/alters tables
    // In production, only sync if --sync flag is passed
    // In development, always sync
    if (SYNC_DB) {
      await sequelize.sync({ alter: true });
      console.log('[DB] Models synced to database');
    }

    // Listen on 0.0.0.0 so cPanel Passenger proxy can reach us
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n  PMS Caregiver Backend`);
      console.log(`  ─────────────────────────────────`);
      console.log(`  Port:    ${PORT}`);
      console.log(`  Env:     ${NODE_ENV}`);
      console.log(`  DB:      ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
      console.log(`  Health:  http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('[Startup] Failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

start();

module.exports = { server, io };
