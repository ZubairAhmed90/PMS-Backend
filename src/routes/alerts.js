const { Router } = require('express');
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/:patientId', alertController.listAlerts);
router.get('/detail/:alertId', alertController.getAlert);
router.post('/:alertId/confirm', alertController.confirmAlert);

module.exports = router;
