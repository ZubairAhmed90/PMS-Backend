const { Router } = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Invoice CRUD under an organization
router.get('/:orgId/invoices', invoiceController.listInvoices);
router.get('/invoices/:id', invoiceController.getInvoice);
router.post('/:orgId/invoices', authorize('hospital_staff', 'admin'), invoiceController.createInvoice);
router.put('/invoices/:id', authorize('hospital_staff', 'admin'), invoiceController.updateInvoice);
router.post('/invoices/:id/pay', authorize('hospital_staff', 'admin'), invoiceController.recordPayment);
router.delete('/invoices/:id', authorize('admin'), invoiceController.deleteInvoice);

module.exports = router;
