const { Invoice, InvoiceItem, Patient, Admission, Organization } = require('../models');
const { Op } = require('sequelize');

function generateInvoiceNumber() {
  const prefix = 'INV';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${date}-${rand}`;
}

function calculateItemAmount(item) {
  const quantity = parseFloat(item.quantity) || 1;
  const unitPrice = parseFloat(item.unit_price) || parseFloat(item.amount) || 0;
  return parseFloat((quantity * unitPrice).toFixed(2));
}

function calculateTotals(items, taxRate = 0, discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;
  return { subtotal, tax_amount: taxAmount, discount_amount: discountAmount, total_amount: Math.max(0, totalAmount) };
}

async function createInvoiceItems(invoiceId, items) {
  if (!items || items.length === 0) return [];
  return InvoiceItem.bulkCreate(
    items.map((item) => ({
      invoice_id: invoiceId,
      description: item.description || 'Item',
      quantity: parseFloat(item.quantity) || 1,
      unit_price: parseFloat(item.unit_price) || parseFloat(item.amount) || 0,
      amount: calculateItemAmount(item),
    }))
  );
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
      { model: InvoiceItem, as: 'items' },
    ],
  });
}

async function createInvoice(data) {
  const items = data.items || [];
  const totals = calculateTotals(items, data.tax_rate || 0, data.discount_amount || 0);

  const invoice = await Invoice.create({
    ...data,
    invoice_number: data.invoice_number || generateInvoiceNumber(),
    ...totals,
  });

  await createInvoiceItems(invoice.id, items);
  return getInvoice(invoice.id);
}

async function updateInvoice(invoiceId, data) {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) return null;

  let updatePayload = { ...data };
  if (data.items) {
    const totals = calculateTotals(data.items, data.tax_rate || 0, data.discount_amount || invoice.discount_amount);
    Object.assign(updatePayload, totals);
  }

  await invoice.update(updatePayload);

  if (data.items) {
    await InvoiceItem.destroy({ where: { invoice_id: invoice.id } });
    await createInvoiceItems(invoice.id, data.items);
  }

  return getInvoice(invoice.id);
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
  await InvoiceItem.destroy({ where: { invoice_id: invoice.id } });
  await invoice.destroy();
  return true;
}

module.exports = { listInvoices, getInvoice, createInvoice, updateInvoice, recordPayment, deleteInvoice };
