const { Router } = require('express');
const staffController = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Staff CRUD under an organization
router.get('/:orgId/staff', staffController.listStaff);
router.get('/staff/:id', staffController.getStaff);
router.get('/staff/:id/schedule', staffController.getStaffSchedule);
router.post('/:orgId/staff', authorize('hospital_staff', 'admin'), staffController.createStaff);
router.put('/staff/:id', authorize('hospital_staff', 'admin'), staffController.updateStaff);
router.delete('/staff/:id', authorize('admin'), staffController.deleteStaff);

module.exports = router;
