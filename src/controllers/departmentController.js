const departmentService = require('../services/departmentService');

async function listDepartments(req, res, next) {
  try {
    const orgId = req.params.orgId || req.user.organization_id;
    const departments = await departmentService.listDepartments(orgId, req.query);
    res.json(departments);
  } catch (err) {
    next(err);
  }
}

async function getDepartment(req, res, next) {
  try {
    const dept = await departmentService.getDepartment(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  } catch (err) {
    next(err);
  }
}

async function createDepartment(req, res, next) {
  try {
    const data = { ...req.body, organization_id: req.params.orgId || req.user.organization_id };
    const dept = await departmentService.createDepartment(data);
    res.status(201).json(dept);
  } catch (err) {
    next(err);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const dept = await departmentService.updateDepartment(req.params.id, req.body);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  } catch (err) {
    next(err);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const deleted = await departmentService.deleteDepartment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
