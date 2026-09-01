const { Router } = require('express');
const vitalsController = require('../controllers/vitalsController');

const router = Router();

router.post('/ingest', vitalsController.ingestVitals);

module.exports = router;
