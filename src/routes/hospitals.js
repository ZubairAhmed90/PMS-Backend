const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Admission, Patient, Organization, Alert, VitalReading, Device } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const router = Router();

// --- Webhook management (hospital_staff only) ---
router.post('/:orgId/webhook', authenticate, authorize('hospital_staff'), async (req, res, next) => {
  try {
    const org = await Organization.findByPk(req.params.orgId);
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    await org.update({ webhook_url: req.body.webhook_url });
    res.json({ webhook_url: org.webhook_url });
  } catch (err) {
    next(err);
  }
});

// --- Pull API: currently admitted patients with latest risk score ---
router.get('/:orgId/patients', authenticate, authorize('hospital_staff'), async (req, res, next) => {
  try {
    const admissions = await Admission.findAll({
      where: {
        organization_id: req.params.orgId,
        discharged_at: { [Op.is]: null },
      },
      include: [{
        model: Patient,
        as: 'patient',
        include: [{ model: Device, as: 'devices' }],
      }],
    });

    const patients = await Promise.all(
      admissions.map(async (a) => {
        const patient = a.patient.toJSON();
        patient.room_or_location = a.room_or_location;
        patient.admission_id = a.id;

        // Get latest vital reading
        const lastVital = await VitalReading.findOne({
          where: { patient_id: patient.id },
          order: [['timestamp', 'DESC']],
        });
        patient.latest_vitals = lastVital;

        // Get cached risk score from Redis (or compute from latest alert)
        const lastAlert = await Alert.findOne({
          where: { patient_id: patient.id },
          order: [['timestamp', 'DESC']],
        });
        patient.latest_risk_score = lastAlert ? lastAlert.risk_score : 0;
        patient.latest_alert = lastAlert;

        return patient;
      })
    );

    res.json(patients);
  } catch (err) {
    next(err);
  }
});

// --- Pull API: vitals for a patient since a timestamp ---
router.get('/patients/:patientId/vitals', authenticate, async (req, res, next) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 3600000);
    const vitals = await VitalReading.findAll({
      where: {
        patient_id: req.params.patientId,
        timestamp: { [Op.gte]: since },
      },
      order: [['timestamp', 'ASC']],
    });
    res.json(vitals);
  } catch (err) {
    next(err);
  }
});

// --- FHIR-shaped Observation endpoint ---
router.get('/fhir/Observation', authenticate, async (req, res, next) => {
  try {
    const { patient: patientId } = req.query;
    if (!patientId) return res.status(400).json({ error: 'patient query param required' });

    const readings = await VitalReading.findAll({
      where: { patient_id: patientId },
      order: [['timestamp', 'DESC']],
      limit: 50,
    });

    const observations = readings.flatMap((r) => {
      const entries = [];
      if (r.heart_rate != null) {
        entries.push({
          resourceType: 'Observation',
          id: `${r.id}-hr`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
          valueQuantity: { value: r.heart_rate, unit: 'bpm' },
          effectiveDateTime: r.timestamp,
        });
      }
      if (r.spo2 != null) {
        entries.push({
          resourceType: 'Observation',
          id: `${r.id}-spo2`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation' }] },
          valueQuantity: { value: r.spo2, unit: '%' },
          effectiveDateTime: r.timestamp,
        });
      }
      return entries;
    });

    res.json({ resourceType: 'Bundle', type: 'searchset', entry: observations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
