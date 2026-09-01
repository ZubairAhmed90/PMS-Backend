const appointmentService = require('../services/appointmentService');

async function listAppointments(req, res, next) {
  try {
    const orgId = req.params.orgId || req.user.organization_id;
    const appointments = await appointmentService.listAppointments(orgId, req.query);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

async function getAppointment(req, res, next) {
  try {
    const appt = await appointmentService.getAppointment(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function createAppointment(req, res, next) {
  try {
    const data = { ...req.body, organization_id: req.params.orgId || req.user.organization_id };
    const appt = await appointmentService.createAppointment(data);
    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const appt = await appointmentService.updateAppointment(req.params.id, req.body);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const { reason } = req.body;
    const appt = await appointmentService.cancelAppointment(req.params.id, reason);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const deleted = await appointmentService.deleteAppointment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAppointments, getAppointment, createAppointment, updateAppointment, cancelAppointment, deleteAppointment };
