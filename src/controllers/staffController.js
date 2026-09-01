const staffService = require('../services/staffService');

async function listStaff(req, res, next) {
  try {
    const orgId = req.params.orgId || req.user.organization_id;
    const staff = await staffService.listStaff(orgId, req.query);
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

async function getStaff(req, res, next) {
  try {
    const staff = await staffService.getStaff(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

async function createStaff(req, res, next) {
  try {
    const data = { ...req.body, organization_id: req.params.orgId || req.user.organization_id };
    const staff = await staffService.createStaff(data);
    res.status(201).json(staff);
  } catch (err) {
    next(err);
  }
}

async function updateStaff(req, res, next) {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

async function deleteStaff(req, res, next) {
  try {
    const deleted = await staffService.deleteStaff(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    next(err);
  }
}

async function getStaffSchedule(req, res, next) {
  try {
    const { from, to } = req.query;
    const schedule = await staffService.getStaffSchedule(req.params.id, from, to);
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

module.exports = { listStaff, getStaff, createStaff, updateStaff, deleteStaff, getStaffSchedule };
