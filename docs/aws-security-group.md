# 🛡️ AWS EC2 Security Group Configuration

This document defines the **only** inbound rules your EC2 Security Group should have.
All other ports must remain closed — including 3306, 3307, 5000, and 9200/9201.

---

## ✅ Required Inbound Rules

| Rule | Type | Protocol | Port Range | Source | Purpose |
|------|------|----------|------------|--------|---------|
| 1 | SSH | TCP | 22 | **Your IP only** (`x.x.x.x/32`) | Remote server management |
| 2 | HTTP | TCP | 80 | `0.0.0.0/0` | Frontend (redirects to HTTPS) |
| 3 | HTTPS | TCP | 443 | `0.0.0.0/0` | Frontend + API (via Nginx proxy) |

## ❌ Ports That Must NOT Be Open

| Port | Service | Reason |
|------|---------|--------|
| 3306 / 3307 | MySQL | Internal Docker network only; never expose to internet |
| 9200 / 9201 | Elasticsearch | No auth enabled; exposure = full read/write access to product data |
| 5000 | Node.js backend | Nginx proxies `/api/*` internally; direct exposure bypasses all proxy protections |

---

## 🖥️ AWS Console Setup (Step-by-Step)

1. Go to **EC2 → Security Groups** → Select your instance's SG
2. Click **Inbound rules → Edit inbound rules**
3. **Delete** any existing rules for ports 3306, 3307, 5000, 9200, 9201
4. Add the following rules:

### Rule 1 — SSH (your IP only)
```
Type:       SSH
Protocol:   TCP
Port:       22
Source:     My IP   ← AWS auto-fills your current public IP
```
> ⚠️ If your IP changes (home/office), update this rule. Consider AWS Systems Manager Session Manager as a no-SSH alternative.

### Rule 2 — HTTP
```
Type:       HTTP
Protocol:   TCP
Port:       80
Source:     0.0.0.0/0, ::/0   (IPv4 + IPv6)
```

### Rule 3 — HTTPS (add when you configure SSL)
```
Type:       HTTPS
Protocol:   TCP
Port:       443
Source:     0.0.0.0/0, ::/0   (IPv4 + IPv6)
```

---

## ⚡ AWS CLI Commands (Alternative)

Replace `sg-xxxxxxxxxxxxxxxxx` with your actual Security Group ID and `YOUR_IP` with your public IP.

```bash
# Get your current public IP
MY_IP=$(curl -s https://checkip.amazonaws.com)/32

# Allow SSH from your IP only
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxxxxxxxxxx \
  --protocol tcp --port 22 --cidr "$MY_IP"

# Allow HTTP from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxxxxxxxxxx \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxxxxxxxxxx \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Revoke any overly-permissive rules (example — remove all-traffic rule)
aws ec2 revoke-security-group-ingress \
  --group-id sg-xxxxxxxxxxxxxxxxx \
  --protocol -1 --port all --cidr 0.0.0.0/0
```

---

## 📦 Recommended EC2 Instance Type

| Use Case | Instance | vCPU | RAM | Notes |
|----------|----------|------|-----|-------|
| ❌ Avoid | t2.micro | 1 | 1 GB | Not enough RAM for ES (512 MB heap) + MySQL + Node |
| ✅ Minimum | t3.medium | 2 | 4 GB | Sufficient for all 4 Docker services |
| ⭐ Recommended | t3.large | 2 | 8 GB | Comfortable headroom; better for ES + traffic spikes |
| 🚀 Production | t3.xlarge | 4 | 16 GB | For high traffic; consider separating ES to its own instance |

### Storage
- Minimum **20 GB** EBS (gp3) for OS + Docker images + volumes
- Add a **dedicated EBS volume** for Docker volumes (`/var/lib/docker`) if expecting large data
- Enable **EBS Snapshots** via AWS Data Lifecycle Manager for automated backups

---

## 🔒 Additional Hardening (Recommended)

```bash
# On your EC2 instance — disable password auth for SSH (key-pairs only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban to block repeated SSH brute force attempts
sudo apt update && sudo apt install -y fail2ban
sudo systemctl enable fail2ban && sudo systemctl start fail2ban

# Enable UFW as a host-level firewall (double protection)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```
