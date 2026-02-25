# 📈 Scaling Strategy

## Current Architecture

```
Internet → EC2 (t3.medium)
              ├── Docker: Nginx (port 80)     ← frontend + API proxy
              ├── Docker: Node.js backend     ← internal only
              ├── Docker: MySQL               ← internal only
              └── Docker: Elasticsearch       ← internal only
```

---

## Phase 1 — Vertical Scaling (No Code Changes Required)

Upgrade the EC2 instance type when CPU or memory hits sustained >70%.

```
t3.medium  (2 vCPU / 4 GB)  →  current minimum
t3.large   (2 vCPU / 8 GB)  →  recommended production
t3.xlarge  (4 vCPU / 16 GB) →  high-traffic production
```

**Steps:**
1. Stop instance → Change instance type → Start
2. Zero code changes required — Docker volumes survive

---

## Phase 2 — Separate the Database (Critical for Reliability)

Move MySQL out of Docker to **AWS RDS** for managed backups, Multi-AZ, and connection pooling.

```
Before:  EC2 → Docker MySQL
After:   EC2 → AWS RDS MySQL  (Multi-AZ standby for failover)
```

**Steps:**
```bash
# 1. Create RDS MySQL 8.0 instance in AWS Console (same VPC as EC2)
# 2. Dump current data
docker exec ecommerce_mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" ecommerce > dump.sql

# 3. Import to RDS
mysql -h your-rds-endpoint.rds.amazonaws.com -u ecomuser -p ecommerce < dump.sql

# 4. Update .env on EC2
DB_HOST=your-rds-endpoint.rds.amazonaws.com

# 5. Remove mysql service from docker-compose.yml
# 6. Restart containers
docker compose up -d
```

---

## Phase 3 — Horizontal Scaling (Multiple EC2 Instances)

Use **AWS Application Load Balancer (ALB)** with an **Auto Scaling Group**.

```
Internet → ALB
             ├── EC2 Instance 1 (Nginx + Node.js)
             ├── EC2 Instance 2 (Nginx + Node.js)
             └── EC2 Instance N (auto-scaled)
                          ↓
                     AWS RDS (shared, Multi-AZ)
                     AWS ElastiCache Elasticsearch (shared)
```

**Requirements before scaling horizontally:**
- ✅ Stateless backend (already is — JWT auth, no server-side sessions)
- ✅ Shared database (RDS from Phase 2)
- ✅ Shared search (move ES to AWS OpenSearch / ElastiCache)
- ✅ Shared file storage (use S3 for any uploaded files, not local disk)

**ALB Setup:**
1. Create **Target Group** (HTTP, port 80, health check: `/health`)
2. Register EC2 instance(s) in target group
3. Create **ALB** → listener on port 80 (and 443 for HTTPS)
4. Create **Launch Template** from working EC2 AMI
5. Create **Auto Scaling Group** (min: 1, desired: 2, max: 5)
6. Set **scaling policy**: scale out when CPU > 60% for 5 min

---

## Phase 4 — Container Orchestration (ECS Fargate)

For fully managed containers without managing EC2 instances:

```
AWS ECS Fargate
  ├── Task: backend  (Node.js) — auto-scaled by ECS
  ├── Task: frontend (Nginx)   — auto-scaled by ECS
  └── External services:
       ├── AWS RDS MySQL
       └── AWS OpenSearch
```

**Advantages:**
- No patching of EC2 OS
- Fine-grained CPU/memory allocation per container
- Native integration with AWS secrets management

---

## Scaling Reference Table

| Traffic Level | Setup | Monthly Cost (est.) |
|--------------|-------|---------------------|
| Dev / test    | t3.medium + Docker MySQL | ~$30 |
| Small (<1K users/day) | t3.large + Docker MySQL | ~$60 |
| Medium (<10K users/day) | t3.xlarge + RDS db.t3.small | ~$150 |
| High (>10K users/day) | ALB + 2× t3.large + RDS Multi-AZ | ~$350 |
| Enterprise | ECS Fargate + RDS Multi-AZ + OpenSearch | ~$700+ |

---

## Immediate Actions for Current Stack

```bash
# Monitor container resource usage continuously
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Set memory limits to prevent OOM kills (add to docker-compose.yml services)
# elasticsearch:
#   deploy:
#     resources:
#       limits:
#         memory: 1.5G
# mysql:
#   deploy:
#     resources:
#       limits:
#         memory: 1G
# backend:
#   deploy:
#     resources:
#       limits:
#         memory: 512M
```
