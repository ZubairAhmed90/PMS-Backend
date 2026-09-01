const alertService = require('../services/alertService');
const { Alert } = require('../models');

async function listAlerts(req, res, next) {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;
    const alerts = await Alert.findAll({
      where: { patient_id: patientId },
      order: [['timestamp', 'DESC']],
      limit,
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}

async function confirmAlert(req, res, next) {
  try {
    const { ok } = req.body;
    const alert = await alertService.confirmAlert(req.params.alertId, ok);
    if (!alert) return res.status(404).json({ error: 'Alert not found or already resolved' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
}

async function getAlert(req, res, next) {
  try {
    const alert = await Alert.findByPk(req.params.alertId);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAlerts, confirmAlert, getAlert };
