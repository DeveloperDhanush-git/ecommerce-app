# 🛒 Ecommerce App

A full-stack ecommerce application with:

- **Frontend** — React + Vite (served via Nginx)
- **Backend** — Node.js + Express REST API
- **Database** — MySQL 8 (auto-seeded with 100 products across 10 categories)
- **Search** — Elasticsearch 8 (synonym-aware full-text search)

Everything runs inside Docker — no need to install Node.js, MySQL, or Elasticsearch locally.

---

## 🚀 Quick Start (3 commands)

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/) ≥ 24.x installed and running

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ecommerce-app
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

> ✏️ Open `.env` and fill in strong passwords and secrets before starting.
> Generate secrets with: `openssl rand -hex 32`

### 3. Build & start all services

```bash
docker compose up --build -d
```

Docker will:
- Build the backend and frontend images
- Start MySQL and **automatically create the database + all tables + seed 100 products**
- Start Elasticsearch and sync all products into the search index
- Serve the frontend on **http://localhost**

---

## 🌐 Service URLs

| Service | URL | Notes |
|---|---|---|
| **Frontend** | http://localhost | Only public-facing port |
| **Backend API** | http://localhost/api/* | Via Nginx proxy — not directly exposed |
| **Health Check** | http://localhost/health | Returns JSON status |

> ⚠️ MySQL (port 3306) and Elasticsearch (port 9200) are **internal only** and not accessible from the host by design.

---

## 📋 Useful Commands

```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f mysql

# Restart a single service (e.g. after config change)
docker compose restart backend

# Stop all services (keeps database data)
docker compose down

# Stop and wipe all data (fresh start)
docker compose down -v && docker compose up --build -d

# Check container health
docker compose ps
```

---

## 🗄️ Database

The database is **automatically initialized** on the very first run:

- ✅ Creates the `ecommerce` database
- ✅ Creates all tables (`users`, `categories`, `products`, `category_synonyms`)
- ✅ Seeds **10 categories** and **100 products** (10 per category)

> ⚠️ The seed runs **once** — when the `mysql_data` Docker volume is created for the first time.
> To reset and re-seed: `docker compose down -v && docker compose up -d`

---

## 📁 Project Structure

```
ecommerce-app/
├── docker-compose.yml              # Orchestrates all 4 services
├── .env.example                    # Copy to .env — fill in secrets
├── docs/
│   ├── aws-security-group.md       # EC2 Security Group rules
│   ├── https-setup.md              # Let's Encrypt / Certbot guide
│   ├── monitoring-setup.md         # UptimeRobot, CloudWatch, Sentry
│   └── scaling-strategy.md         # Phase-by-phase scaling guide
├── scripts/
│   ├── backup.sh                   # MySQL backup + optional S3 upload
│   └── deploy.sh                   # Production deploy with health check
├── ecommerce-backend/
│   ├── Dockerfile
│   ├── server.js                   # Express app (helmet, CORS, rate-limit)
│   ├── config/                     # db.js (pool), elasticsearch.js
│   ├── controllers/
│   ├── routes/
│   └── utils/                      # Elasticsearch index + sync scripts
└── frontend/
    ├── Dockerfile                  # Multi-stage build → Nginx
    ├── nginx.conf                  # SPA routing + API proxy + security headers
    └── src/
```

---

## 🔒 Production Checklist

### Before First Deploy
- [ ] Replace ALL placeholder values in `.env` with strong secrets:
  - `openssl rand -hex 32` → for passwords
  - `openssl rand -hex 64` → for `JWT_SECRET`
- [ ] Set `CORS_ORIGIN` to your production domain(s) in `.env`
- [ ] Confirm AWS Security Group only allows ports **22 (your IP), 80, 443** → see `docs/aws-security-group.md`
- [ ] Use EC2 **t3.medium** or larger (Elasticsearch needs ≥ 4 GB RAM)

### Security
- [ ] `helmet` + `express-rate-limit` installed ✅ (already configured in server.js)
- [ ] CORS restricted to known origin(s) ✅ (via `CORS_ORIGIN` env var)
- [ ] MySQL and Elasticsearch NOT exposed externally ✅ (removed from compose ports)
- [ ] Backend port 5000 NOT exposed externally ✅ (internal network only)
- [ ] Graceful shutdown handler ✅ (SIGTERM / SIGINT)
- [ ] `/health` JSON endpoint ✅

### HTTPS (after DNS is configured)
- [ ] Set up Let's Encrypt via Certbot → see `docs/https-setup.md`
- [ ] Enable HSTS header in Nginx config
- [ ] Update `CORS_ORIGIN` to `https://yourdomain.com`

### Backup & Monitoring
- [ ] Schedule `scripts/backup.sh` in crontab (daily at 2 AM)
- [ ] Set up UptimeRobot → pings `/health` every 5 min → see `docs/monitoring-setup.md`
- [ ] Set up AWS CloudWatch disk/memory alarms

### Deploy
```bash
# First deploy
chmod +x scripts/deploy.sh scripts/backup.sh
./scripts/deploy.sh

# Setup daily backup (2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup.sh") | crontab -
```
