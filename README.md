# Ecommerce App — Docker Setup

A full-stack ecommerce application with:
- **Frontend**: React + Vite (served via Nginx)
- **Backend**: Node.js + Express
- **Database**: MySQL 8
- **Search**: Elasticsearch 8

---

## 🚀 Quick Start with Docker

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.x

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set **strong passwords** and a **random JWT secret**:

```bash
# Generate a secure JWT secret
openssl rand -hex 64
```

### 3. Build & Start All Services

```bash
docker compose up --build -d
```

This will start:
| Service         | URL / Port                    |
|-----------------|-------------------------------|
| Frontend (Nginx) | http://localhost              |
| Backend API      | http://localhost:5000         |
| MySQL            | localhost:3306                |
| Elasticsearch    | http://localhost:9200         |

### 4. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
docker compose logs -f elasticsearch
```

### 5. Stop Services

```bash
docker compose down
```

### 6. Stop & Remove Volumes (⚠️ deletes database data)

```bash
docker compose down -v
```

---

## 📁 Project Structure

```
ecommerce-app/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment variable template
├── .env                        # Your local env (NOT committed to git)
├── ecommerce-backend/
│   ├── Dockerfile              # Backend image definition
│   ├── .dockerignore
│   └── ...
└── frontend/
    ├── Dockerfile              # Multi-stage build → Nginx
    ├── nginx.conf              # Nginx config (SPA + API proxy)
    ├── .dockerignore
    └── ...
```

---

## 🔒 Production Notes

- Change all default passwords in `.env` before deploying
- Use a secrets manager (AWS Secrets Manager, Vault, etc.) in production
- Enable Elasticsearch security (`xpack.security.enabled=true`) in production
- Serve over HTTPS using a reverse proxy like Nginx/Traefik with SSL certificates
- Use a managed database service (RDS, Cloud SQL) for better reliability in production
