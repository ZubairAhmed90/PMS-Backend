const { Appointment, Patient, Staff, Department } = require('../models');
const { Op } = require('sequelize');

async function listAppointments(organizationId, filters = {}) {
  const where = { organization_id: organizationId };
  if (filters.status) where.status = filters.status;
  if (filters.staff_id) where.staff_id = filters.staff_id;
  if (filters.patient_id) where.patient_id = filters.patient_id;
  if (filters.type) where.type = filters.type;
  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    where.appointment_date = { [Op.between]: [start, end] };
  }
  if (filters.from_date && filters.to_date) {
    where.appointment_date = { [Op.between]: [new Date(filters.from_date), new Date(filters.to_date)] };
  }

  return Appointment.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'patient_number', 'phone'] },
      { model: Staff, as: 'staff', attributes: ['id', 'first_name', 'last_name', 'specialization', 'role'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] },
    ],
    order: [['appointment_date', 'ASC']],
    limit: filters.limit || 50,
  });
}

async function getAppointment(appointmentId) {
  return Appointment.findByPk(appointmentId, {
    include: [
      { model: Patient, as: 'patient' },
      { model: Staff, as: 'staff', include: [{ model: Department, as: 'department' }] },
      { model: Department, as: 'department' },
    ],
  });
}

async function createAppointment(data) {
  return Appointment.create(data);
}

async function updateAppointment(appointmentId, data) {
  const appt = await Appointment.findByPk(appointmentId);
  if (!appt) return null;
  await appt.update(data);
  return appt;
}

async function cancelAppointment(appointmentId, reason) {
  const appt = await Appointment.findByPk(appointmentId);
  if (!appt) return null;
  await appt.update({ status: 'cancelled', cancelled_reason: reason });
  return appt;
}

async function deleteAppointment(appointmentId) {
  const appt = await Appointment.findByPk(appointmentId);
  if (!appt) return false;
  await appt.destroy();
  return true;
}

module.exports = { listAppointments, getAppointment, createAppointment, updateAppointment, cancelAppointment, deleteAppointment };
