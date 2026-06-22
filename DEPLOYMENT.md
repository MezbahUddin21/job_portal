# Deployment Guide - Fly.io

## Backend Deployment

### Prerequisites
- Fly.io account
- `flyctl` CLI installed: https://fly.io/docs/hands-on/install-flyctl/

### Environment Variables Needed

Create a `.env.flew` file or set these in Fly.io:

```env
APP_NAME="Job Portal"
APP_ENV=production
APP_DEBUG=false
APP_TIMEZONE=UTC

# Database - Use Fly Postgres
DB_CONNECTION=pgsql
DB_HOST=<postgres-internal-dns>
DB_PORT=5432
DB_DATABASE=job_portal
DB_USERNAME=<db-user>
DB_PASSWORD=<db-password>

# Frontend URL
FRONTEND_URL=https://job-portal-frontend.fly.dev
SANCTUM_STATEFUL_DOMAINS=job-portal-frontend.fly.dev
```

### Deploy Backend API

```bash
cd backend

# Initialize (one-time)
flyctl launch --name job-portal-api --region iad --dockerfile Dockerfile

# Or deploy existing app
flyctl deploy

# Set secrets (one-time)
flyctl secrets set APP_KEY="base64:..." DB_PASSWORD="..."

# View logs
flyctl logs
```

### Create PostgreSQL Database

```bash
# Create a managed Postgres database
flyctl postgres create --name job-portal-db --region iad

# Attach to API
flyctl postgres attach job-portal-db

# Run migrations
flyctl ssh console
  php artisan migrate:fresh --seed
  exit
```

## Frontend Deployment

### Deploy React to Fly.io

```bash
cd frontend

# Initialize
flyctl launch --name job-portal-frontend --region iad --dockerfile Dockerfile

# Set API URL
flyctl secrets set VITE_API_URL="https://job-portal-api.fly.dev"

# Deploy
flyctl deploy
```

### Or: Deploy Frontend to Vercel (Recommended)

Vercel is better for static sites:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Update `frontend/src/lib/axios.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://job-portal-api.fly.dev'
```

## Update CORS in Backend

In `backend/config/cors.php`:

```php
'allowed_origins' => [
    'https://job-portal-frontend.fly.dev',
    'https://your-vercel-domain.vercel.app',
],
```

## Domain Setup

```bash
# Add custom domain (optional)
flyctl certs create api.jobportal.com
flyctl ips list
# Add CNAME record to your DNS
```

## Useful Commands

```bash
# View app status
flyctl status

# SSH into app
flyctl ssh console

# Scale machines
flyctl scale count 2

# Monitor
flyctl monitor

# Destroy app
flyctl destroy job-portal-api
```

## Troubleshooting

**502 Bad Gateway:**
- Check logs: `flyctl logs`
- Ensure database is attached
- Verify migrations ran

**CORS errors:**
- Update `allowed_origins` in config/cors.php
- Restart app: `flyctl deploy`

**Database connection:**
- Check credentials: `flyctl secrets list`
- Test connection: `flyctl ssh console` → `php artisan tinker`
