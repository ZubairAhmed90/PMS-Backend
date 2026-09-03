const http = require('http');
const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');
const { setupSocketIO } = require('./socket');

const server = http.createServer(app);

// --- Socket.io ---
const io = setupSocketIO(server);
app.set('io', io);

// --- Start ---
async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] MySQL connected');

    // Sync models in development (use migrations in production)
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Models synced');
    }

    server.listen(config.port, () => {
      console.log(`[API] Server running on port ${config.port} (${process.env.HOSTNAME || 'local'})`);
    });
  } catch (err) {
    console.error('[Startup] Failed:', err);
    process.exit(1);
  }
}

start();

module.exports = { server, io };
