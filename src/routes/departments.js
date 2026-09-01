const { Router } = require('express');
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Department CRUD under an organization
router.get('/:orgId/departments', departmentController.listDepartments);
router.get('/departments/:id', departmentController.getDepartment);
router.post('/:orgId/departments', authorize('hospital_staff', 'admin'), departmentController.createDepartment);
router.put('/departments/:id', authorize('hospital_staff', 'admin'), departmentController.updateDepartment);
router.delete('/departments/:id', authorize('hospital_staff', 'admin'), departmentController.deleteDepartment);

module.exports = router;
