const { Room, Department, Organization, Admission, Patient } = require('../models');
const { Op } = require('sequelize');

async function listRooms(organizationId, filters = {}) {
  const where = { organization_id: organizationId };
  if (filters.status) where.status = filters.status;
  if (filters.room_type) where.room_type = filters.room_type;
  if (filters.department_id) where.department_id = filters.department_id;
  if (filters.floor) where.floor = filters.floor;

  return Room.findAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'name'] },
    ],
    order: [['room_number', 'ASC']],
  });
}

async function getRoom(roomId) {
  return Room.findByPk(roomId, {
    include: [
      { model: Department, as: 'department' },
      { model: Organization, as: 'organization', attributes: ['id', 'name'] },
    ],
  });
}

async function createRoom(data) {
  return Room.create(data);
}

async function updateRoom(roomId, data) {
  const room = await Room.findByPk(roomId);
  if (!room) return null;
  await room.update(data);
  return room;
}

async function deleteRoom(roomId) {
  const room = await Room.findByPk(roomId);
  if (!room) return false;
  await room.destroy();
  return true;
}

async function getRoomOccupancy(organizationId) {
  const rooms = await Room.findAll({
    where: { organization_id: organizationId },
    attributes: ['id', 'room_number', 'room_type', 'capacity', 'occupied', 'status', 'floor', 'department_id'],
    include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
  });

  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + (r.occupied || 0), 0);

  return {
    rooms,
    summary: {
      total_rooms: rooms.length,
      total_capacity: totalCapacity,
      total_occupied: totalOccupied,
      available: rooms.filter((r) => r.status === 'available').length,
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
      occupancy_rate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    },
  };
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom, getRoomOccupancy };
