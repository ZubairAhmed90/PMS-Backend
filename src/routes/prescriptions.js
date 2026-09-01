const { Router } = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Prescription CRUD nested under patient
router.get('/:patientId/prescriptions', prescriptionController.listPrescriptions);
router.get('/prescriptions/:id', prescriptionController.getPrescription);
router.post('/:patientId/prescriptions', prescriptionController.createPrescription);
router.put('/prescriptions/:id', prescriptionController.updatePrescription);
router.post('/prescriptions/:id/discontinue', prescriptionController.discontinuePrescription);
router.delete('/prescriptions/:id', prescriptionController.deletePrescription);

module.exports = router;
