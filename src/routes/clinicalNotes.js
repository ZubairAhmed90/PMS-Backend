const { Router } = require('express');
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Clinical notes CRUD nested under patient
router.get('/:patientId/clinical-notes', clinicalNoteController.listClinicalNotes);
router.get('/clinical-notes/:id', clinicalNoteController.getClinicalNote);
router.post('/:patientId/clinical-notes', clinicalNoteController.createClinicalNote);
router.put('/clinical-notes/:id', clinicalNoteController.updateClinicalNote);
router.delete('/clinical-notes/:id', clinicalNoteController.deleteClinicalNote);

module.exports = router;
