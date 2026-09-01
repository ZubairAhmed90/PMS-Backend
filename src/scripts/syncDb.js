require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../models');

async function sync() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('[Sync] All models synced successfully');
  process.exit(0);
}

sync().catch((err) => {
  console.error('[Sync] Failed:', err);
  process.exit(1);
});
