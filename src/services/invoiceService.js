const { Invoice, Patient, Admission, Organization } = require('../models');
const { Op } = require('sequelize');

function generateInvoiceNumber() {
  const prefix = 'INV';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${date}-${rand}`;
}

function calculateTotals(items, taxRate = 0, discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;
  return { subtotal, tax_amount: taxAmount, discount_amount: discountAmount, total_amount: Math.max(0, totalAmount) };
}

async function listInvoices(organizationId, filters = {}) {
  const where = {};
  if (organizationId) where.organization_id = organizationId;
  if (filters.patient_id) where.patient_id = filters.patient_id;
  if (filters.status) where.status = filters.status;

  return Invoice.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'patient_number'] },
      { model: Admission, as: 'admission', attributes: ['id', 'room_or_location', 'admitted_at'] },
    ],
    order: [['created_at', 'DESC']],
    limit: filters.limit || 50,
  });
}

async function getInvoice(invoiceId) {
  return Invoice.findByPk(invoiceId, {
    include: [
      { model: Patient, as: 'patient' },
      { model: Admission, as: 'admission' },
      { model: Organization, as: 'organization', attributes: ['id', 'name', 'address', 'phone'] },
    ],
  });
}

async function createInvoice(data) {
  const items = data.items || [];
  const totals = calculateTotals(items, data.tax_rate || 0, data.discount_amount || 0);
  return Invoice.create({
    ...data,
    invoice_number: data.invoice_number || generateInvoiceNumber(),
    ...totals,
  });
}

async function updateInvoice(invoiceId, data) {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) return null;
  if (data.items) {
    const totals = calculateTotals(data.items, data.tax_rate || 0, data.discount_amount || invoice.discount_amount);
    Object.assign(data, totals);
  }
  await invoice.update(data);
  return invoice;
}

async function recordPayment(invoiceId, amount, method) {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) return null;
  const newPaid = parseFloat(invoice.paid_amount) + parseFloat(amount);
  const total = parseFloat(invoice.total_amount);
  const newStatus = newPaid >= total ? 'paid' : 'partial';
  await invoice.update({ paid_amount: newPaid, payment_method: method, status: newStatus });
  return invoice;
}

async function deleteInvoice(invoiceId) {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) return false;
  await invoice.destroy();
  return true;
}

module.exports = { listInvoices, getInvoice, createInvoice, updateInvoice, recordPayment, deleteInvoice };
