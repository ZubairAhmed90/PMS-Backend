const { Department, Room, Staff, Organization } = require('../models');
const { Op } = require('sequelize');

async function listDepartments(organizationId, filters = {}) {
  const where = { organization_id: organizationId };
  if (filters.status) where.status = filters.status;
  return Department.findAll({
    where,
    include: [{ model: Room, as: 'rooms', attributes: ['id', 'room_number', 'status'] }],
    order: [['name', 'ASC']],
  });
}

async function getDepartment(departmentId) {
  return Department.findByPk(departmentId, {
    include: [
      { model: Room, as: 'rooms' },
      { model: Staff, as: 'staffMembers', attributes: ['id', 'first_name', 'last_name', 'role', 'specialization'] },
      { model: Organization, as: 'organization', attributes: ['id', 'name'] },
    ],
  });
}

async function createDepartment(data) {
  return Department.create(data);
}

async function updateDepartment(departmentId, data) {
  const dept = await Department.findByPk(departmentId);
  if (!dept) return null;
  await dept.update(data);
  return dept;
}

async function deleteDepartment(departmentId) {
  const dept = await Department.findByPk(departmentId);
  if (!dept) return false;
  await dept.destroy();
  return true;
}

module.exports = { listDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
