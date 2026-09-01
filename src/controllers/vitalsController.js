const vitalsService = require('../services/vitalsService');

async function ingestVitals(req, res, next) {
  try {
    const { device_key } = req.body;
    if (!device_key) {
      return res.status(400).json({ error: 'device_key is required' });
    }
    const result = await vitalsService.ingestVitals(device_key, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { ingestVitals };
