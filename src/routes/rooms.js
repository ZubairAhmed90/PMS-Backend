const { Router } = require('express');
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Room CRUD under an organization
router.get('/:orgId/rooms', roomController.listRooms);
router.get('/:orgId/rooms/occupancy', roomController.getRoomOccupancy);
router.get('/rooms/:id', roomController.getRoom);
router.post('/:orgId/rooms', authorize('hospital_staff', 'admin'), roomController.createRoom);
router.put('/rooms/:id', authorize('hospital_staff', 'admin'), roomController.updateRoom);
router.delete('/rooms/:id', authorize('hospital_staff', 'admin'), roomController.deleteRoom);

module.exports = router;
