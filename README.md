# Smart Patient Monitoring System — Backend

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- (Optional) Node.js 20+ for local development without Docker

### Running with Docker Compose

```bash
# From the healthcare-monitoring-system directory
docker-compose up --build
```

This starts:
- **2 backend API replicas** (backend-1, backend-2) on port 4000
- **Nginx** load balancer on port 80 (round-robin to both backends)
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Mosquitto** MQTT broker on port 1883
- **MQTT ingestion worker** (separate process)
- **Socket.io relay** (Redis → Socket.io bridge)

### Seed demo data

```bash
# After docker-compose is running, exec into one of the backends:
docker-compose exec backend-1 node src/seeders/seed.js
```

This creates:
- Hospital: "Alkhidmat Hospital Karachi"
- Hospital staff: `nurse@alkhidmat.pk` / `hospital123`
- Caregiver: `ahmed.caregiver@gmail.com` / `caregiver123`
- 3 patients with devices (2 admitted, 1 home)

### Verify load balancing

```bash
# Hit the health endpoint multiple times — you should see alternating hostnames:
curl http://localhost/health
curl http://localhost/health
```

### Run the device simulator

```bash
# From the backend directory (with Docker running):
docker-compose exec backend-1 node simulator/deviceSimulator.js dev-fatima-bibi
docker-compose exec backend-1 node simulator/deviceSimulator.js dev-muhammad-rashid --simulate-fall
docker-compose exec backend-1 node simulator/deviceSimulator.js dev-amina-khatoon --simulate-hr-spike
```

### Running locally (without Docker)

```bash
cd backend
cp .env.example .env  # Edit with local connection strings
npm install
npm run db:sync       # Create tables
npm run db:seed       # Seed demo data
npm start             # Start API server
npm run worker        # In a separate terminal: start MQTT worker
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/api/v1/patients` | Yes | List accessible patients |
| POST | `/api/v1/patients` | Yes | Create patient |
| GET | `/api/v1/patients/:id` | Yes | Get patient details |
| GET | `/api/v1/patients/:id/vitals` | Yes | Get vital readings |
| GET | `/api/v1/patients/:id/alerts` | Yes | Get alerts |
| POST | `/api/v1/vitals/ingest` | No | Ingest vitals by device_key |
| POST | `/api/v1/alerts/:id/confirm` | Yes | Confirm/dismiss alert |
| GET | `/api/v1/hospitals/:orgId/patients` | Yes (staff) | Pull API: admitted patients |
| POST | `/api/v1/hospitals/:orgId/webhook` | Yes (staff) | Set webhook URL |
| GET | `/fhir/Observation?patient=:id` | Yes | FHIR-shaped observations |

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database, Redis, app config
│   ├── models/         # Sequelize models + associations
│   ├── middleware/      # Auth, access control, error handler
│   ├── services/       # Business logic (auth, baseline, risk, LLM, alerts)
│   ├── controllers/    # Request handlers
│   ├── routes/         # Express route definitions
│   ├── seeders/        # Database seed scripts
│   ├── scripts/        # Utility scripts
│   ├── app.js          # Express app setup
│   ├── server.js       # Entry point
│   └── socket.js       # Socket.io setup with Redis adapter
├── workers/
│   ├── ingest.js       # MQTT ingestion worker
│   └── socketRelay.js  # Redis → Socket.io relay
├── simulator/
│   └── deviceSimulator.js  # Synthetic vitals generator
├── scripts/
│   └── testLlmSummary.js
├── Dockerfile
└── package.json
```
