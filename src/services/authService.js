const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

async function register({ email, password, role, organization_id }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password_hash,
    role: role || 'patient',
    organization_id: organization_id || null,
  });

  return generateToken(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  return generateToken(user);
}

function generateToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    },
  };
}

module.exports = { register, login };
