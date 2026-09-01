const { Router } = require('express');
const labResultController = require('../controllers/labResultController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Lab results CRUD nested under patient
router.get('/:patientId/lab-results', labResultController.listLabResults);
router.get('/lab-results/:id', labResultController.getLabResult);
router.post('/:patientId/lab-results', labResultController.createLabResult);
router.put('/lab-results/:id', labResultController.updateLabResult);
router.delete('/lab-results/:id', labResultController.deleteLabResult);

module.exports = router;
