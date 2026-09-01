const { Router } = require('express');
const patientController = require('../controllers/patientController');
const deviceController = require('../controllers/deviceController');
const admissionController = require('../controllers/admissionController');
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');
const { patientAccess } = require('../middleware/accessControl');

const router = Router();

router.use(authenticate);

// Patient CRUD
router.get('/', patientController.listPatients);
router.post('/', patientController.createPatient);
router.get('/:id', patientAccess, patientController.getPatient);
router.put('/:id', patientAccess, patientController.updatePatient);
router.delete('/:id', patientAccess, patientController.deletePatient);

// Vitals & alerts for a patient
router.get('/:id/vitals', patientAccess, patientController.getVitals);
router.get('/:id/alerts', patientAccess, patientController.getAlerts);

// Devices for a patient
router.get('/:patientId/devices', patientAccess, deviceController.listDevices);
router.post('/:patientId/devices', patientAccess, deviceController.createDevice);
router.delete('/:patientId/devices/:deviceId', deviceController.deleteDevice);

// Admissions for a patient
router.get('/:patientId/admissions', admissionController.listAdmissions);
router.post('/:patientId/admissions', admissionController.createAdmission);
router.put('/:patientId/admissions/:admissionId/discharge', admissionController.dischargePatient);

module.exports = router;
