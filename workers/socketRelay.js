/**
 * Socket Relay Worker
 *
 * Subscribes to Redis channels and re-emits events via Socket.io.
 * This allows the MQTT worker to stay decoupled from Socket.io,
 * while still broadcasting real-time updates to all connected clients.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedisClient } = require('../src/config/redis');
const { Admission, Patient } = require('../src/models');
const { sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function start() {
  await sequelize.authenticate();
  console.log('[Relay] DB connected');

  const redis = getRedisClient();
  const subClient = redis.duplicate();

  // Create a minimal Socket.io server on port 4001 (used only by the relay)
  const server = http.createServer();
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  // Use Redis adapter so emissions reach all backend replicas
  io.adapter(createAdapter(redis, subClient));

  server.listen(4001, () => {
    console.log('[Relay] Socket relay server on port 4001');
  });

  // Subscribe to Redis channels
  const listener = redis.duplicate();

  await listener.subscribe('vitals:new');
  await listener.subscribe('alert:new');
  console.log('[Relay] Subscribed to vitals:new, alert:new');

  listener.on('message', async (channel, message) => {
    try {
      const data = JSON.parse(message);

      if (channel === 'vitals:new') {
        const { patientId, reading, risk } = data;
        io.to(`patient:${patientId}`).emit('vitals:update', { patientId, reading, risk });

        // Also emit to hospital rooms for admitted patients
        const orgIds = await getActiveOrgIds(patientId);
        for (const orgId of orgIds) {
          io.to(`hospital:${orgId}`).emit('vitals:update', { patientId, reading, risk });
        }
      }

      if (channel === 'alert:new') {
        const { patientId, alert, risk } = data;
        io.to(`patient:${patientId}`).emit('alert:new', { patientId, alert });

        const orgIds = await getActiveOrgIds(patientId);
        for (const orgId of orgIds) {
          io.to(`hospital:${orgId}`).emit('alert:new', { patientId, alert });
          io.to(`hospital:${orgId}`).emit('risk:update', { patientId, risk });
        }
      }
    } catch (err) {
      console.error('[Relay] Error:', err.message);
    }
  });
}

async function getActiveOrgIds(patientId) {
  const admissions = await Admission.findAll({
    where: { patient_id: patientId, discharged_at: { [Op.is]: null } },
    attributes: ['organization_id'],
    raw: true,
  });
  return [...new Set(admissions.map((a) => a.organization_id))];
}

start().catch((err) => {
  console.error('[Relay] Fatal:', err);
  process.exit(1);
});
