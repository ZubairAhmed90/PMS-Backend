const { Room, RoomAmenity, Department, Organization, Admission, Patient } = require('../models');
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
      { model: RoomAmenity, as: 'amenities', attributes: ['id', 'amenity'] },
    ],
    order: [['room_number', 'ASC']],
  });
}

async function getRoom(roomId) {
  return Room.findByPk(roomId, {
    include: [
      { model: Department, as: 'department' },
      { model: Organization, as: 'organization', attributes: ['id', 'name'] },
      { model: RoomAmenity, as: 'amenities', attributes: ['id', 'amenity'] },
    ],
  });
}

async function createRoom(data) {
  const { amenities, ...roomData } = data;
  const room = await Room.create(roomData);
  if (amenities && amenities.length > 0) {
    await RoomAmenity.bulkCreate(
      amenities.map((amenity) => ({ room_id: room.id, amenity }))
    );
  }
  return getRoom(room.id);
}

async function updateRoom(roomId, data) {
  const room = await Room.findByPk(roomId);
  if (!room) return null;

  const { amenities, ...roomData } = data;
  await room.update(roomData);

  if (amenities !== undefined) {
    await RoomAmenity.destroy({ where: { room_id: room.id } });
    if (amenities.length > 0) {
      await RoomAmenity.bulkCreate(
        amenities.map((amenity) => ({ room_id: room.id, amenity }))
      );
    }
  }

  return getRoom(room.id);
}

async function deleteRoom(roomId) {
  const room = await Room.findByPk(roomId);
  if (!room) return false;
  await RoomAmenity.destroy({ where: { room_id: room.id } });
  await room.destroy();
  return true;
}

async function getRoomOccupancy(organizationId) {
  const rooms = await Room.findAll({
    where: { organization_id: organizationId },
    attributes: ['id', 'room_number', 'room_type', 'capacity', 'status', 'floor', 'department_id'],
    include: [
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: RoomAmenity, as: 'amenities', attributes: ['id', 'amenity'] },
    ],
  });

  // Calculate occupied count dynamically from active admissions
  const roomIds = rooms.map((r) => r.id);
  const admissions = await Admission.findAll({
    where: {
      room_or_location: { [Op.ne]: null },
      discharged_at: null,
    },
    attributes: ['room_or_location'],
  });

  const occupancyMap = admissions.reduce((map, admission) => {
    const roomLoc = admission.room_or_location;
    map[roomLoc] = (map[roomLoc] || 0) + 1;
    return map;
  }, {});

  const roomsWithOccupancy = rooms.map((room) => {
    const occupied = occupancyMap[room.room_number] || 0;
    return { ...room.toJSON(), occupied };
  });

  const totalCapacity = roomsWithOccupancy.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalOccupied = roomsWithOccupancy.reduce((sum, r) => sum + (r.occupied || 0), 0);

  return {
    rooms: roomsWithOccupancy,
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
