/**
 * Seed script — creates comprehensive demo data for the full PMS system.
 *
 * Creates:
 * - 1 hospital organization (enhanced with type, address, etc.)
 * - 1 admin user, 1 hospital_staff user, 1 caregiver user
 * - Departments (Cardiology, Neurology, Orthopedics, Emergency, General Medicine)
 * - Rooms (various types across departments)
 * - Staff (doctors, nurses across departments)
 * - 5 demo patients with full medical profiles
 * - Devices for each patient
 * - Appointments, Prescriptions, Lab Results, Clinical Notes, Invoices
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const {
  sequelize, User, Organization, Patient, Admission, Device,
  Department, Room, Staff, Appointment, Prescription, LabResult,
  ClinicalNote, Invoice, InvoiceItem, RoomAmenity,
  PatientAllergy, PatientCondition,
} = require('../models');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('[Seed] Database connected and synced');

  // ─── Organization ───────────────────────────────────────────────
  const [org] = await Organization.findOrCreate({
    where: { name: 'Alkhidmat Hospital Karachi' },
    defaults: {
      id: uuidv4(),
      name: 'Alkhidmat Hospital Karachi',
      type: 'hospital',
      address: 'Block 6, Gulshan-e-Iqbal, Karachi',
      phone: '+92-21-34567890',
      email: 'info@alkhidmathospital.pk',
      license_number: 'HOSP-Sindh-2024-001',
      total_beds: 250,
      webhook_url: null,
      api_key: 'demo-api-key-12345',
    },
  });
  console.log(`[Seed] Organization: ${org.name} (${org.id})`);

  // ─── Users ──────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const [adminUser] = await User.findOrCreate({
    where: { email: 'admin@alkhidmat.pk' },
    defaults: { id: uuidv4(), email: 'admin@alkhidmat.pk', first_name: 'System', last_name: 'Admin', password_hash: adminHash, role: 'admin', organization_id: org.id },
  });
  console.log(`[Seed] Admin: ${adminUser.email} (password: admin123)`);

  const staffHash = await bcrypt.hash('hospital123', 10);
  const [staffUser] = await User.findOrCreate({
    where: { email: 'nurse@alkhidmat.pk' },
    defaults: { id: uuidv4(), email: 'nurse@alkhidmat.pk', first_name: 'Sara', last_name: 'Nurse', password_hash: staffHash, role: 'hospital_staff', organization_id: org.id },
  });
  console.log(`[Seed] Hospital staff: ${staffUser.email} (password: hospital123)`);

  const caregiverHash = await bcrypt.hash('caregiver123', 10);
  const [caregiver] = await User.findOrCreate({
    where: { email: 'ahmed.caregiver@gmail.com' },
    defaults: { id: uuidv4(), email: 'ahmed.caregiver@gmail.com', first_name: 'Ahmed', last_name: 'Khan', password_hash: caregiverHash, role: 'caregiver' },
  });
  console.log(`[Seed] Caregiver: ${caregiver.email} (password: caregiver123)`);

  // ─── Departments (heads assigned after staff creation) ──────────
  const deptData = [
    { name: 'Cardiology', code: 'CARD', floor: '2nd', description: 'Heart and cardiovascular system', head_employee_id: 'DOC-001' },
    { name: 'Neurology', code: 'NEUR', floor: '3rd', description: 'Brain and nervous system', head_employee_id: 'DOC-002' },
    { name: 'Orthopedics', code: 'ORTH', floor: '1st', description: 'Bones, joints, and muscles', head_employee_id: 'DOC-003' },
    { name: 'Emergency', code: 'EMER', floor: 'Ground', description: 'Emergency and trauma care', head_employee_id: 'DOC-004' },
    { name: 'General Medicine', code: 'GENM', floor: '1st', description: 'General internal medicine', head_employee_id: 'DOC-005' },
  ];

  const departments = {};
  for (const d of deptData) {
    const { head_employee_id, ...deptFields } = d;
    const [dept] = await Department.findOrCreate({
      where: { organization_id: org.id, code: d.code },
      defaults: { id: uuidv4(), organization_id: org.id, ...deptFields, status: 'active' },
    });
    departments[d.code] = dept;
    console.log(`[Seed] Department: ${dept.name} (${dept.code})`);
  }

  // ─── Staff ──────────────────────────────────────────────────────
  const staffData = [
    { first_name: 'Asim', last_name: 'Raza', role: 'doctor', specialization: 'Cardiologist', department_id: departments.CARD.id, qualification: 'MBBS, FCPS (Cardiology)', license_number: 'PMC-12345', shift: 'morning', phone: '+92-300-1111111', email: 'dr.asim@alkhidmat.pk', employee_id: 'DOC-001' },
    { first_name: 'Fatima', last_name: 'Sheikh', role: 'doctor', specialization: 'Neurologist', department_id: departments.NEUR.id, qualification: 'MBBS, FCPS (Neurology)', license_number: 'PMC-12346', shift: 'morning', phone: '+92-300-2222222', email: 'dr.fatima@alkhidmat.pk', employee_id: 'DOC-002' },
    { first_name: 'Tariq', last_name: 'Mehmood', role: 'doctor', specialization: 'Orthopedic Surgeon', department_id: departments.ORTH.id, qualification: 'MBBS, MS (Ortho)', license_number: 'PMC-12347', shift: 'morning', phone: '+92-300-3333333', email: 'dr.tariq@alkhidmat.pk', employee_id: 'DOC-003' },
    { first_name: 'Nadia', last_name: 'Hussain', role: 'doctor', specialization: 'Emergency Medicine', department_id: departments.EMER.id, qualification: 'MBBS, FCPS (Emergency)', license_number: 'PMC-12348', shift: 'evening', phone: '+92-300-4444444', email: 'dr.nadia@alkhidmat.pk', employee_id: 'DOC-004' },
    { first_name: 'Kamran', last_name: 'Ali', role: 'doctor', specialization: 'Internal Medicine', department_id: departments.GENM.id, qualification: 'MBBS, FCPS (Medicine)', license_number: 'PMC-12349', shift: 'morning', phone: '+92-300-5555555', email: 'dr.kamran@alkhidmat.pk', employee_id: 'DOC-005' },
    { first_name: 'Ayesha', last_name: 'Malik', role: 'nurse', specialization: 'Cardiac Care', department_id: departments.CARD.id, qualification: 'BSc Nursing', shift: 'morning', phone: '+92-300-6666666', employee_id: 'NUR-001' },
    { first_name: 'Bilal', last_name: 'Ahmed', role: 'nurse', specialization: 'ICU Care', department_id: departments.CARD.id, qualification: 'BSc Nursing', shift: 'evening', phone: '+92-300-7777777', employee_id: 'NUR-002' },
    { first_name: 'Sana', last_name: 'Pervez', role: 'nurse', specialization: 'Neuro Care', department_id: departments.NEUR.id, qualification: 'BSc Nursing', shift: 'morning', phone: '+92-300-8888888', employee_id: 'NUR-003' },
    { first_name: 'Imran', last_name: 'Khan', role: 'technician', specialization: 'Lab Technician', department_id: departments.GENM.id, qualification: 'DMLT', shift: 'morning', phone: '+92-300-9999999', employee_id: 'TECH-001' },
    { first_name: 'Rabia', last_name: 'Noor', role: 'pharmacist', specialization: 'Clinical Pharmacy', department_id: departments.GENM.id, qualification: 'Pharm-D', shift: 'morning', phone: '+92-300-0000001', employee_id: 'PHARM-001' },
  ];

  const staffMembers = {};
  for (const s of staffData) {
    const [staff] = await Staff.findOrCreate({
      where: { organization_id: org.id, employee_id: s.employee_id },
      defaults: { id: uuidv4(), organization_id: org.id, status: 'active', hire_date: '2024-01-15', ...s },
    });
    staffMembers[s.employee_id] = staff;
  }
  console.log(`[Seed] ${staffData.length} staff members created`);

  // ─── Assign department heads ────────────────────────────────────
  for (const d of deptData) {
    const head = staffMembers[d.head_employee_id];
    if (head) {
      await Department.update(
        { head_of_department_id: head.id },
        { where: { id: departments[d.code].id } }
      );
    }
  }
  console.log('[Seed] Department heads assigned');

  // ─── Rooms ──────────────────────────────────────────────────────
  const roomData = [
    { room_number: '101', room_type: 'general', floor: '1st', department_id: departments.GENM.id, capacity: 6, rate_per_day: 2000, status: 'occupied', amenities: ['Oxygen', 'Nurse Call', 'TV'] },
    { room_number: '102', room_type: 'general', floor: '1st', department_id: departments.GENM.id, capacity: 6, rate_per_day: 2000, status: 'occupied', amenities: ['Oxygen', 'Nurse Call'] },
    { room_number: '103', room_type: 'private', floor: '1st', department_id: departments.GENM.id, capacity: 1, rate_per_day: 8000, status: 'occupied', amenities: ['AC', 'TV', 'Attached Bath', 'Nurse Call'] },
    { room_number: '201', room_type: 'private', floor: '2nd', department_id: departments.CARD.id, capacity: 1, rate_per_day: 10000, status: 'occupied', amenities: ['AC', 'TV', 'Attached Bath', 'Cardiac Monitor', 'Nurse Call'] },
    { room_number: '202', room_type: 'semi_private', floor: '2nd', department_id: departments.CARD.id, capacity: 2, rate_per_day: 6000, status: 'occupied', amenities: ['AC', 'TV', 'Nurse Call'] },
    { room_number: '203', room_type: 'private', floor: '2nd', department_id: departments.CARD.id, capacity: 1, rate_per_day: 10000, status: 'available', amenities: ['AC', 'TV', 'Attached Bath', 'Cardiac Monitor', 'Nurse Call'] },
    { room_number: 'ICU-1', room_type: 'icu', floor: '2nd', department_id: departments.CARD.id, capacity: 1, rate_per_day: 25000, status: 'occupied', amenities: ['Ventilator', 'Cardiac Monitor', 'Oxygen', 'Dialysis Hookup'] },
    { room_number: 'ICU-2', room_type: 'icu', floor: '2nd', department_id: departments.CARD.id, capacity: 1, rate_per_day: 25000, status: 'available', amenities: ['Ventilator', 'Cardiac Monitor', 'Oxygen', 'Dialysis Hookup'] },
    { room_number: 'ICU-3', room_type: 'icu', floor: '2nd', department_id: departments.NEUR.id, capacity: 1, rate_per_day: 25000, status: 'occupied', amenities: ['Ventilator', 'Neuro Monitor', 'Oxygen'] },
    { room_number: '301', room_type: 'ward', floor: '3rd', department_id: departments.NEUR.id, capacity: 8, rate_per_day: 1500, status: 'occupied', amenities: ['Oxygen', 'Nurse Call'] },
    { room_number: '302', room_type: 'private', floor: '3rd', department_id: departments.NEUR.id, capacity: 1, rate_per_day: 10000, status: 'available', amenities: ['AC', 'TV', 'Attached Bath', 'Nurse Call'] },
    { room_number: 'ER-1', room_type: 'emergency', floor: 'Ground', department_id: departments.EMER.id, capacity: 1, rate_per_day: 5000, status: 'available', amenities: ['Oxygen', 'Crash Cart', 'Nurse Call'] },
    { room_number: 'ER-2', room_type: 'emergency', floor: 'Ground', department_id: departments.EMER.id, capacity: 1, rate_per_day: 5000, status: 'occupied', amenities: ['Oxygen', 'Crash Cart', 'Nurse Call'] },
    { room_number: 'OT-1', room_type: 'operation_theater', floor: '1st', department_id: departments.ORTH.id, capacity: 1, rate_per_day: 50000, status: 'available', amenities: ['Surgical Lights', 'Anesthesia Machine', 'Sterile Equipment'] },
    { room_number: '401', room_type: 'general', floor: '1st', department_id: departments.ORTH.id, capacity: 4, rate_per_day: 2500, status: 'occupied', amenities: ['Oxygen', 'Nurse Call', 'TV'] },
    { room_number: 'ISO-1', room_type: 'isolation', floor: 'Ground', department_id: departments.GENM.id, capacity: 1, rate_per_day: 15000, status: 'maintenance', amenities: ['Negative Pressure', 'AC', 'Attached Bath'] },
  ];

  const rooms = [];
  for (const r of roomData) {
    const { amenities, ...roomFields } = r;
    const [room] = await Room.findOrCreate({
      where: { organization_id: org.id, room_number: r.room_number },
      defaults: { id: uuidv4(), organization_id: org.id, ...roomFields },
    });
    if (amenities && amenities.length > 0) {
      const existingAmenities = await RoomAmenity.findAll({ where: { room_id: room.id } });
      if (existingAmenities.length === 0) {
        await RoomAmenity.bulkCreate(
          amenities.map((amenity) => ({ id: uuidv4(), room_id: room.id, amenity }))
        );
      }
    }
    rooms.push(room);
  }
  console.log(`[Seed] ${rooms.length} rooms created`);

  // ─── Patients ───────────────────────────────────────────────────
  const patientData = [
    {
      name: 'Fatima Bibi', dob: '1952-03-15', gender: 'female', phone: '+92-321-1111111', blood_group: 'A+',
      allergies: ['Penicillin'],
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      admitted: true, room: 'ICU-1', patient_number: 'PT-2025-001',
    },
    {
      name: 'Muhammad Rashid', dob: '1948-07-22', gender: 'male', phone: '+92-321-2222222', blood_group: 'O+',
      allergies: [],
      conditions: ['Coronary Artery Disease', 'Previous MI'],
      admitted: true, room: '201', patient_number: 'PT-2025-002',
    },
    {
      name: 'Amina Khatoon', dob: '1955-11-08', gender: 'female', phone: '+92-321-3333333', blood_group: 'B+',
      allergies: ['Sulfa drugs'],
      conditions: ['Osteoarthritis'],
      admitted: false, room: null, patient_number: 'PT-2025-003',
    },
    {
      name: 'Ali Hassan', dob: '1975-01-30', gender: 'male', phone: '+92-321-4444444', blood_group: 'AB+',
      allergies: ['Aspirin'],
      conditions: ['Epilepsy', 'Migraine'],
      admitted: true, room: '301', patient_number: 'PT-2025-004',
    },
    {
      name: 'Zainab Begum', dob: '1960-05-12', gender: 'female', phone: '+92-321-5555555', blood_group: 'O-',
      allergies: ['Latex'],
      conditions: ['Chronic Kidney Disease Stage 3', 'Anemia'],
      admitted: true, room: '103', patient_number: 'PT-2025-005',
    },
  ];

  const patientRecords = [];
  for (const p of patientData) {
    const { allergies, conditions, ...patientFields } = p;
    const [patient] = await Patient.findOrCreate({
      where: { name: p.name },
      defaults: {
        id: uuidv4(),
        owner_user_id: caregiver.id,
        name: p.name,
        patient_number: p.patient_number,
        date_of_birth: p.dob,
        gender: p.gender,
        phone: p.phone,
        blood_group: p.blood_group,
        emergency_contact_name: 'Ahmed Khan',
        emergency_contact_phone: '+92-321-0000000',
        status: 'active',
      },
    });
    patientRecords.push(patient);
    console.log(`[Seed] Patient: ${patient.name} (${patient.patient_number})`);

    // 4NF: allergies stored in separate table (multi-valued attribute)
    const existingAllergies = await PatientAllergy.findAll({ where: { patient_id: patient.id } });
    if (existingAllergies.length === 0 && allergies && allergies.length > 0) {
      await PatientAllergy.bulkCreate(
        allergies.map((allergy) => ({ id: uuidv4(), patient_id: patient.id, allergy, severity: 'unknown' }))
      );
      console.log(`[Seed]   Allergies: ${allergies.join(', ')}`);
    }

    // 4NF: medical history conditions stored in separate table
    const existingConditions = await PatientCondition.findAll({ where: { patient_id: patient.id } });
    if (existingConditions.length === 0 && conditions && conditions.length > 0) {
      await PatientCondition.bulkCreate(
        conditions.map((condition) => ({ id: uuidv4(), patient_id: patient.id, condition, status: 'active' }))
      );
      console.log(`[Seed]   Conditions: ${conditions.join(', ')}`);
    }

    const deviceKey = `dev-${patient.name.toLowerCase().replace(/\s+/g, '-')}`;
    await Device.findOrCreate({
      where: { device_key: deviceKey },
      defaults: { id: uuidv4(), patient_id: patient.id, device_key: deviceKey },
    });
    console.log(`[Seed]   Device key: ${deviceKey}`);

    if (p.admitted) {
      await Admission.findOrCreate({
        where: { patient_id: patient.id, organization_id: org.id, discharged_at: null },
        defaults: { id: uuidv4(), patient_id: patient.id, organization_id: org.id, room_or_location: p.room, admitted_at: new Date() },
      });
      console.log(`[Seed]   Admitted at ${org.name} — ${p.room}`);
    }
  }

  // ─── Appointments ───────────────────────────────────────────────
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);

  const apptData = [
    { patient_id: patientRecords[0].id, staff_id: staffMembers['DOC-001'].id, department_id: departments.CARD.id, appointment_date: tomorrow, type: 'follow_up', reason: 'Post-ICU cardiac evaluation', status: 'scheduled', duration_minutes: 30 },
    { patient_id: patientRecords[1].id, staff_id: staffMembers['DOC-001'].id, department_id: departments.CARD.id, appointment_date: tomorrow, type: 'checkup', reason: 'Routine cardiac monitoring', status: 'confirmed', duration_minutes: 20 },
    { patient_id: patientRecords[2].id, staff_id: staffMembers['DOC-003'].id, department_id: departments.ORTH.id, appointment_date: nextWeek, type: 'consultation', reason: 'Knee pain evaluation', status: 'scheduled', duration_minutes: 30 },
    { patient_id: patientRecords[3].id, staff_id: staffMembers['DOC-002'].id, department_id: departments.NEUR.id, appointment_date: tomorrow, type: 'follow_up', reason: 'Epilepsy medication review', status: 'scheduled', duration_minutes: 45 },
    { patient_id: patientRecords[4].id, staff_id: staffMembers['DOC-005'].id, department_id: departments.GENM.id, appointment_date: nextWeek, type: 'checkup', reason: 'Kidney function follow-up', status: 'scheduled', duration_minutes: 30 },
  ];

  for (const a of apptData) {
    await Appointment.create({ id: uuidv4(), organization_id: org.id, ...a });
  }
  console.log(`[Seed] ${apptData.length} appointments created`);

  // ─── Prescriptions ──────────────────────────────────────────────
  const rxData = [
    { patient_id: patientRecords[0].id, prescribed_by: staffMembers['DOC-001'].id, medication_name: 'Metoprolol', generic_name: 'Metoprolol Succinate', dosage: '50mg', frequency: 'Twice daily', route: 'oral', duration_days: 30, instructions: 'Take with food' },
    { patient_id: patientRecords[0].id, prescribed_by: staffMembers['DOC-001'].id, medication_name: 'Aspirin', generic_name: 'Acetylsalicylic acid', dosage: '75mg', frequency: 'Once daily', route: 'oral', duration_days: 90, instructions: 'Take after meals' },
    { patient_id: patientRecords[1].id, prescribed_by: staffMembers['DOC-001'].id, medication_name: 'Atorvastatin', generic_name: 'Atorvastatin Calcium', dosage: '40mg', frequency: 'Once daily at bedtime', route: 'oral', duration_days: 90, instructions: 'Avoid grapefruit' },
    { patient_id: patientRecords[3].id, prescribed_by: staffMembers['DOC-002'].id, medication_name: 'Levetiracetam', generic_name: 'Levetiracetam', dosage: '500mg', frequency: 'Twice daily', route: 'oral', duration_days: 60, instructions: 'Do not stop abruptly' },
    { patient_id: patientRecords[4].id, prescribed_by: staffMembers['DOC-005'].id, medication_name: 'Erythropoietin', generic_name: 'Epoetin Alfa', dosage: '4000 IU', frequency: 'Once weekly', route: 'sc', duration_days: 30, instructions: 'Subcutaneous injection' },
  ];

  for (const rx of rxData) {
    await Prescription.create({ id: uuidv4(), organization_id: org.id, status: 'active', ...rx });
  }
  console.log(`[Seed] ${rxData.length} prescriptions created`);

  // ─── Lab Results ────────────────────────────────────────────────
  const labData = [
    { patient_id: patientRecords[0].id, ordered_by: staffMembers['DOC-001'].id, test_name: 'Complete Blood Count', test_category: 'blood', result: 'Hb: 11.2 g/dL', unit: 'g/dL', reference_range: '12-16', is_abnormal: true, status: 'completed', collected_at: new Date(), reported_at: new Date() },
    { patient_id: patientRecords[0].id, ordered_by: staffMembers['DOC-001'].id, test_name: 'Troponin I', test_category: 'cardiac', result: '0.15 ng/mL', unit: 'ng/mL', reference_range: '<0.04', is_abnormal: true, status: 'completed', collected_at: new Date(), reported_at: new Date() },
    { patient_id: patientRecords[1].id, ordered_by: staffMembers['DOC-001'].id, test_name: 'Lipid Panel', test_category: 'blood', result: 'Total Chol: 240 mg/dL', unit: 'mg/dL', reference_range: '<200', is_abnormal: true, status: 'completed', collected_at: new Date(), reported_at: new Date() },
    { patient_id: patientRecords[4].id, ordered_by: staffMembers['DOC-005'].id, test_name: 'Serum Creatinine', test_category: 'blood', result: '2.8 mg/dL', unit: 'mg/dL', reference_range: '0.6-1.2', is_abnormal: true, status: 'completed', collected_at: new Date(), reported_at: new Date() },
    { patient_id: patientRecords[4].id, ordered_by: staffMembers['DOC-005'].id, test_name: 'Urine R/E', test_category: 'urine', result: 'Protein: 2+', unit: '', reference_range: 'Negative', is_abnormal: true, status: 'completed', collected_at: new Date(), reported_at: new Date() },
    { patient_id: patientRecords[2].id, ordered_by: staffMembers['DOC-003'].id, test_name: 'X-Ray Knee AP/Lateral', test_category: 'imaging', result: 'Mild joint space narrowing', unit: '', reference_range: '', is_abnormal: true, status: 'completed', collected_at: new Date(), reported_at: new Date() },
  ];

  for (const lab of labData) {
    await LabResult.create({ id: uuidv4(), organization_id: org.id, ...lab });
  }
  console.log(`[Seed] ${labData.length} lab results created`);

  // ─── Clinical Notes ─────────────────────────────────────────────
  const noteData = [
    { patient_id: patientRecords[0].id, staff_id: staffMembers['DOC-001'].id, note_type: 'admission', title: 'ICU Admission Note', content: 'Patient admitted to ICU with chest pain and elevated troponin. Started on cardiac protocol. Continuous monitoring initiated.' },
    { patient_id: patientRecords[0].id, staff_id: staffMembers['NUR-001'].id, note_type: 'nursing', title: 'Nursing Assessment', content: 'Vitals stable. HR 88 bpm, BP 140/90. Patient conscious and oriented. IV access established in left arm.' },
    { patient_id: patientRecords[1].id, staff_id: staffMembers['DOC-001'].id, note_type: 'progress', title: 'Cardiac Follow-up', content: 'Patient responding well to treatment. ECG shows stable rhythm. Plan to continue current medications.' },
    { patient_id: patientRecords[3].id, staff_id: staffMembers['DOC-002'].id, note_type: 'consultation', title: 'Neurology Consultation', content: 'Seizure frequency reduced. Current dose of Levetiracetam appears effective. EEG scheduled for next week.' },
    { patient_id: patientRecords[4].id, staff_id: staffMembers['DOC-005'].id, note_type: 'progress', title: 'Nephrology Update', content: 'Creatinine trending upward. GFR declining. Nephrology referral initiated. Diet modifications recommended.' },
  ];

  for (const note of noteData) {
    await ClinicalNote.create({ id: uuidv4(), organization_id: org.id, ...note });
  }
  console.log(`[Seed] ${noteData.length} clinical notes created`);

  // ─── Invoices ───────────────────────────────────────────────────
  const invoiceData = [
    {
      patient_id: patientRecords[0].id,
      items: [
        { description: 'ICU Room Charges (3 days)', amount: 75000 },
        { description: 'Cardiac Monitoring', amount: 15000 },
        { description: 'Lab Tests (CBC, Troponin)', amount: 8000 },
        { description: 'Medications', amount: 5500 },
        { description: 'Doctor Consultation', amount: 3000 },
      ],
      subtotal: 106500, tax_amount: 0, discount_amount: 5000, total_amount: 101500, paid_amount: 50000, status: 'partial',
      invoice_number: 'INV-20250828-0001', due_date: '2025-09-28',
    },
    {
      patient_id: patientRecords[1].id,
      items: [
        { description: 'Private Room (5 days)', amount: 50000 },
        { description: 'Cardiac Consultation', amount: 3000 },
        { description: 'Lipid Panel', amount: 4000 },
        { description: 'Medications', amount: 3500 },
      ],
      subtotal: 60500, tax_amount: 0, discount_amount: 0, total_amount: 60500, paid_amount: 60500, status: 'paid',
      invoice_number: 'INV-20250828-0002', due_date: '2025-09-15',
    },
    {
      patient_id: patientRecords[4].id,
      items: [
        { description: 'Private Room (2 days)', amount: 16000 },
        { description: 'Lab Tests (Creatinine, Urine)', amount: 5000 },
        { description: 'Erythropoietin Injection', amount: 12000 },
        { description: 'Doctor Consultation', amount: 3000 },
      ],
      subtotal: 36000, tax_amount: 0, discount_amount: 2000, total_amount: 34000, paid_amount: 0, status: 'issued',
      invoice_number: 'INV-20250828-0003', due_date: '2025-09-30',
    },
  ];

  for (const inv of invoiceData) {
    const { items, ...invoiceFields } = inv;
    const [invoice, created] = await Invoice.findOrCreate({
      where: { invoice_number: invoiceFields.invoice_number },
      defaults: { id: uuidv4(), organization_id: org.id, payment_method: inv.paid_amount > 0 ? 'cash' : null, ...invoiceFields },
    });

    if (created && items && items.length > 0) {
      const existingItems = await InvoiceItem.findAll({ where: { invoice_id: invoice.id } });
      if (existingItems.length === 0) {
        await InvoiceItem.bulkCreate(
          items.map((item) => ({
            id: uuidv4(),
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.amount,
            amount: item.amount || (item.quantity || 1) * (item.unit_price || 0),
          }))
        );
      }
    }
  }
  console.log(`[Seed] ${invoiceData.length} invoices created`);

  // ─── Summary ────────────────────────────────────────────────────
  console.log('\n[Seed] === Demo credentials ===');
  console.log('Admin:          admin@alkhidmat.pk / admin123');
  console.log('Hospital staff: nurse@alkhidmat.pk / hospital123');
  console.log('Caregiver:      ahmed.caregiver@gmail.com / caregiver123');
  console.log('\n[Seed] === PMS Data ===');
  console.log(`  ${deptData.length} departments, ${rooms.length} rooms, ${staffData.length} staff`);
  console.log(`  ${patientData.length} patients, ${apptData.length} appointments`);
  console.log(`  ${rxData.length} prescriptions, ${labData.length} lab results`);
  console.log(`  ${noteData.length} clinical notes, ${invoiceData.length} invoices`);
  console.log('\n[Seed] === Device keys for simulator ===');
  console.log('  node simulator/deviceSimulator.js dev-fatima-bibi');
  console.log('  node simulator/deviceSimulator.js dev-muhammad-rashid --simulate-fall');
  console.log('  node simulator/deviceSimulator.js dev-amina-khatoon --simulate-hr-spike');
  console.log('  node simulator/deviceSimulator.js dev-ali-hassan');
  console.log('  node simulator/deviceSimulator.js dev-zainab-begum');
  console.log('\n[Seed] Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
