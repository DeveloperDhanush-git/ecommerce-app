# 🛒 Ecommerce App

A full-stack ecommerce application with:

- **Frontend** — React + Vite (served via Nginx)
- **Backend** — Node.js + Express REST API
- **Database** — MySQL 8 (auto-seeded with 100 products across 10 categories)
- **Search** — Elasticsearch 8 (synonym-aware full-text search)

Everything runs inside Docker — no need to install Node.js, MySQL, or anything else locally.

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

> ✅ The default values in `.env.example` work immediately — no editing required.

### 3. Build & start all services

```bash
docker compose up --build -d
```

That's it! Docker will:
- Build the backend and frontend images
- Start MySQL and **automatically create the database + all tables + seed 100 products**
- Start Elasticsearch and sync all products into the search index
- Serve the frontend on **http://localhost**

---

## 🌐 Service URLs

| Service | URL |
|---|---|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost:5000 |
| **MySQL** | localhost:3307 |
| **Elasticsearch** | http://localhost:9201 |

---

## 📋 Useful Commands

```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f mysql
docker compose logs -f elasticsearch
docker compose logs -f frontend

# Stop all services (keeps database data)
docker compose down

# Stop and wipe all data (fresh start)
docker compose down -v
docker compose up --build -d
```

---

## 🗄️ Database

The database is **automatically initialized** on the very first run:

- ✅ Creates the `ecommerce` database
- ✅ Creates all tables (`users`, `categories`, `products`, `category_synonyms`)
- ✅ Seeds **10 categories** and **100 products** (10 per category)

> ⚠️ The seed script only runs **once** — when the `mysql_data` Docker volume is created for the first time.
> If you want to reset and re-seed: `docker compose down -v && docker compose up -d`

---

## 📁 Project Structure

```
ecommerce-app/
├── docker-compose.yml              # Orchestrates all 4 services
├── .env.example                    # Copy this to .env
├── init.sql                        # DB schema + seed data (auto-runs on first start)
├── ecommerce-backend/
│   ├── Dockerfile
│   ├── server.js
│   ├── config/                     # db.js, elasticsearch.js
│   ├── controllers/
│   ├── routes/
│   └── utils/                      # Elasticsearch index + sync
└── frontend/
    ├── Dockerfile                  # Multi-stage build → Nginx
    ├── nginx.conf                  # SPA routing + API proxy
    └── src/
```

---

## 🔒 Production Checklist

Before deploying to a real server:

- [ ] Change all passwords in `.env` to strong unique values
- [ ] Generate a secure JWT secret: `openssl rand -hex 64`
- [ ] Enable Elasticsearch security (`xpack.security.enabled=true`)
- [ ] Use HTTPS with a reverse proxy (Nginx/Traefik + Let's Encrypt)
- [ ] Use a managed database (AWS RDS, Cloud SQL) instead of a Docker container
