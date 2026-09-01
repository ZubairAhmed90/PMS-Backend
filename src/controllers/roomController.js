const roomService = require('../services/roomService');

async function listRooms(req, res, next) {
  try {
    const orgId = req.params.orgId || req.user.organization_id;
    const rooms = await roomService.listRooms(orgId, req.query);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

async function getRoom(req, res, next) {
  try {
    const room = await roomService.getRoom(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    next(err);
  }
}

async function createRoom(req, res, next) {
  try {
    const data = { ...req.body, organization_id: req.params.orgId || req.user.organization_id };
    const room = await roomService.createRoom(data);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

async function updateRoom(req, res, next) {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    next(err);
  }
}

async function deleteRoom(req, res, next) {
  try {
    const deleted = await roomService.deleteRoom(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
}

async function getRoomOccupancy(req, res, next) {
  try {
    const orgId = req.params.orgId || req.user.organization_id;
    const result = await roomService.getRoomOccupancy(orgId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom, getRoomOccupancy };
