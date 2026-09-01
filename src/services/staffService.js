const { Staff, Department, Organization, User } = require('../models');
const { Op } = require('sequelize');

async function listStaff(organizationId, filters = {}) {
  const where = { organization_id: organizationId };
  if (filters.role) where.role = filters.role;
  if (filters.department_id) where.department_id = filters.department_id;
  if (filters.status) where.status = filters.status;

  return Staff.findAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: User, as: 'user', attributes: ['id', 'email'] },
    ],
    order: [['last_name', 'ASC']],
  });
}

async function getStaff(staffId) {
  return Staff.findByPk(staffId, {
    include: [
      { model: Department, as: 'department' },
      { model: Organization, as: 'organization', attributes: ['id', 'name'] },
      { model: User, as: 'user', attributes: ['id', 'email', 'role'] },
    ],
  });
}

async function createStaff(data) {
  return Staff.create(data);
}

async function updateStaff(staffId, data) {
  const staff = await Staff.findByPk(staffId);
  if (!staff) return null;
  await staff.update(data);
  return staff;
}

async function deleteStaff(staffId) {
  const staff = await Staff.findByPk(staffId);
  if (!staff) return false;
  await staff.destroy();
  return true;
}

async function getStaffSchedule(staffId, startDate, endDate) {
  const { Appointment } = require('../models');
  const where = { staff_id: staffId };
  if (startDate && endDate) {
    where.appointment_date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }
  return Appointment.findAll({
    where,
    include: [{ model: require('../models').Patient, as: 'patient', attributes: ['id', 'name'] }],
    order: [['appointment_date', 'ASC']],
  });
}

module.exports = { listStaff, getStaff, createStaff, updateStaff, deleteStaff, getStaffSchedule };
