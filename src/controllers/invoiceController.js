const invoiceService = require('../services/invoiceService');

async function listInvoices(req, res, next) {
  try {
    const orgId = req.params.orgId || req.user.organization_id;
    const invoices = await invoiceService.listInvoices(orgId, req.query);
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

async function getInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function createInvoice(req, res, next) {
  try {
    const data = { ...req.body, organization_id: req.params.orgId || req.user.organization_id };
    const invoice = await invoiceService.createInvoice(data);
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}

async function updateInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const { amount, payment_method } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount is required' });
    const invoice = await invoiceService.recordPayment(req.params.id, amount, payment_method);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

async function deleteInvoice(req, res, next) {
  try {
    const deleted = await invoiceService.deleteInvoice(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvoices, getInvoice, createInvoice, updateInvoice, recordPayment, deleteInvoice };
