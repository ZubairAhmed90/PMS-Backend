const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports — existing
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const vitalsRoutes = require('./routes/vitals');
const alertRoutes = require('./routes/alerts');
const hospitalRoutes = require('./routes/hospitals');

// Route imports — PMS modules
const departmentRoutes = require('./routes/departments');
const roomRoutes = require('./routes/rooms');
const staffRoutes = require('./routes/staff');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const labResultRoutes = require('./routes/labResults');
const clinicalNoteRoutes = require('./routes/clinicalNotes');
const invoiceRoutes = require('./routes/invoices');

const app = express();

// --- CORS — configurable for production ---
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    replica: process.env.HOSTNAME || 'unknown',
  });
});

// --- Existing Routes ---
app.use('/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/vitals', vitalsRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);

// FHIR endpoint at top level
app.use('/fhir', hospitalRoutes);

// --- PMS Module Routes ---
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/invoices', invoiceRoutes);

// Patient-nested PMS routes (prescriptions, lab results, clinical notes)
app.use('/api/v1/patients', prescriptionRoutes);
app.use('/api/v1/patients', labResultRoutes);
app.use('/api/v1/patients', clinicalNoteRoutes);

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
