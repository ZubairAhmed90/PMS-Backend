/**
 * Device Simulator
 *
 * Publishes realistic synthetic vitals to MQTT for a given device_key.
 *
 * Usage:
 *   node simulator/deviceSimulator.js <device_key>
 *   node simulator/deviceSimulator.js <device_key> --simulate-fall
 *   node simulator/deviceSimulator.js <device_key> --simulate-hr-spike
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mqtt = require('mqtt');
const config = require('../src/config');

const args = process.argv.slice(2);
const deviceKey = args.find((a) => !a.startsWith('--'));
const simulateFall = args.includes('--simulate-fall');
const simulateHrSpike = args.includes('--simulate-hr-spike');

if (!deviceKey) {
  console.log('Usage: node deviceSimulator.js <device_key> [--simulate-fall] [--simulate-hr-spike]');
  process.exit(1);
}

console.log(`[Simulator] Device: ${deviceKey}`);
console.log(`[Simulator] Mode: ${simulateFall ? 'FALL' : simulateHrSpike ? 'HR_SPIKE' : 'NORMAL'}`);

const client = mqtt.connect(config.mqtt.brokerUrl, {
  clientId: `sim-${deviceKey}-${Date.now()}`,
});

// Base vitals
let heartRate = 72;
let spo2 = 97;
let tickCount = 0;
let fallTriggered = false;

client.on('connect', () => {
  console.log('[Simulator] Connected to MQTT broker');
  setInterval(() => publishReading(), 2000);
});

function publishReading() {
  tickCount++;

  let hr = heartRate;
  let ox = spo2;
  let ax = 0.02 + randomJitter(0.05);
  let ay = 0.98 + randomJitter(0.05); // gravity on Y axis
  let az = 0.01 + randomJitter(0.05);

  // --- Normal drift ---
  heartRate += randomJitter(1.5);
  heartRate = clamp(heartRate, 60, 100);

  spo2 += randomJitter(0.3);
  spo2 = clamp(spo2, 95, 100);

  // --- Fall simulation ---
  if (simulateFall && tickCount === 15 && !fallTriggered) {
    fallTriggered = true;
    console.log('[Simulator] FALL DETECTED — spike + stillness');
    ax = 3.2;
    ay = 0.1;
    az = 0.5;
    hr = 110;
  } else if (simulateFall && fallTriggered && tickCount > 15 && tickCount < 25) {
    // Stillness after fall
    ax = 0.001;
    ay = 0.001;
    az = 0.001;
    hr = 95;
    ox = 94;
  }

  // --- HR spike simulation ---
  if (simulateHrSpike && tickCount > 5) {
    heartRate += 1.5;
    heartRate = clamp(heartRate, 60, 160);
    hr = heartRate;
    if (hr > 130) ox = 93;
  }

  const payload = {
    heart_rate: Math.round(hr * 10) / 10,
    spo2: Math.round(ox * 10) / 10,
    accel_x: Math.round(ax * 1000) / 1000,
    accel_y: Math.round(ay * 1000) / 1000,
    accel_z: Math.round(az * 1000) / 1000,
    timestamp: new Date().toISOString(),
  };

  const topic = `device/${deviceKey}/vitals`;
  client.publish(topic, JSON.stringify(payload));
  console.log(`[Simulator] ${topic} → HR:${payload.heart_rate} SpO2:${payload.spo2} Accel:(${payload.accel_x},${payload.accel_y},${payload.accel_z})`);
}

function randomJitter(range) {
  return (Math.random() - 0.5) * 2 * range;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

client.on('error', (err) => {
  console.error('[Simulator] MQTT error:', err.message);
});
