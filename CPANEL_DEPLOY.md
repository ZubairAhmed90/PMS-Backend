# PMS Backend — cPanel Deployment Guide

## What you need on cPanel

1. A subdomain for the API, e.g., `api.yourdomain.com`
2. cPanel MySQL/MariaDB database
3. cPanel Redis (optional — external Redis like Upstash also works)
4. Node.js selector (cPanel → Setup Node.js App)

## Step-by-step

### 1. Upload code
Upload the contents of `PMS-Backend/` to `/home/USERNAME/pms-backend/` on cPanel.
Make sure these are included:
- `package.json`
- `package-lock.json`
- `src/`
- `workers/`
- `public/.htaccess`

Do **not** upload:
- `node_modules/`
- `.env`
- `dist/`

### 2. Create database
Go to cPanel → MySQL Database Wizard:
- Create database: `pms_production`
- Create user and password
- Add user to database
- Grant all privileges

### 3. Setup Node.js App
cPanel → Setup Node.js App:
- **Application root:** `/home/USERNAME/pms-backend`
- **Application URL:** `api.yourdomain.com`
- **Application startup file:** `src/server.js`
- **Node.js version:** 18 or 20
- Click **Create**

After creation, click **Run NPM Install**.

### 4. Environment variables
In the same cPanel Node.js app page, add these environment variables:

```
DATABASE_URL=mysql://cpanel_db_user:password@localhost:3306/pms_production
JWT_SECRET=your-random-64-char-secret
JWT_EXPIRES_IN=24h
REDIS_URL=redis://localhost:6379
MQTT_BROKER_URL=mqtt://your-broker:1883
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
PORT=4000
NODE_ENV=production
DASHSCOPE_API_KEY=your-key-here
```

### 5. Configure .htaccess
Copy `public/.htaccess` to your subdomain document root.
Replace `USERNAME` and paths with your actual cPanel username/paths.

### 6. Sync database
Click **Run JavaScript Command** or use SSH:
```bash
cd /home/USERNAME/pms-backend
node src/scripts/syncDb.js
node src/seeders/seed.js
```

### 7. Restart app
cPanel → Setup Node.js App → **Restart**.

Test: `https://api.yourdomain.com/health`

## Common issues

### `package.json does not exist`
Make sure you uploaded `package.json` to the application root, not inside `src/`.

### `Cannot find module`
Run `npm install` again from cPanel or SSH. All dependencies are pure JS and should install without compilation errors.

### App does not start
Check the Node.js app error log in cPanel. Usually it's one of:
- Wrong startup file path (`src/server.js`)
- Missing `DATABASE_URL`
- MySQL/MariaDB user cannot connect
