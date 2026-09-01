const { Router } = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Appointment CRUD under an organization
router.get('/:orgId/appointments', appointmentController.listAppointments);
router.get('/appointments/:id', appointmentController.getAppointment);
router.post('/:orgId/appointments', appointmentController.createAppointment);
router.put('/appointments/:id', appointmentController.updateAppointment);
router.post('/appointments/:id/cancel', appointmentController.cancelAppointment);
router.delete('/appointments/:id', authorize('hospital_staff', 'admin'), appointmentController.deleteAppointment);

module.exports = router;
