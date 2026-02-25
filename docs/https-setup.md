# 🔒 HTTPS Setup with Let's Encrypt (Nginx + Certbot)

This guide sets up free HTTPS certificates using **Certbot** on your EC2 instance.

## Prerequisites

- A domain name pointing to your EC2 Elastic IP (A record in DNS)
- Port 80 and 443 open in AWS Security Group
- Docker stack already running (`docker compose up -d`)

---

## Step 1 — Install Certbot on EC2 Host

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2 — Configure Host-Level Nginx (Reverse Proxy to Docker)

Since Certbot needs to manage Nginx, we install Nginx on the EC2 **host** (not just inside Docker)
and have it proxy to the Docker frontend container on port 80.

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/ecommerce`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Certbot will use this for the ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    # Certificate paths (auto-updated by Certbot)
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Mozilla Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS — once HTTPS works, enable this (24h initially, then increase)
    add_header Strict-Transport-Security "max-age=86400; includeSubDomains" always;

    # Proxy to Docker frontend container
    location / {
        proxy_pass         http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

> **Important:** Change your Docker Compose to bind the frontend to `127.0.0.1:8080:80`
> instead of `80:80` so it's NOT accessible directly from the internet — only through the host Nginx.

Update `docker-compose.yml` frontend ports:
```yaml
ports:
  - "127.0.0.1:8080:80"   # internal only — host Nginx proxies here
```

And update host Nginx to proxy to port 8080:
```nginx
proxy_pass http://127.0.0.1:8080;
```

---

## Step 3 — Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com \
    --non-interactive \
    --agree-tos \
    --email your@email.com
```

Certbot will:
1. Verify domain ownership via HTTP challenge
2. Issue certificate from Let's Encrypt
3. Auto-configure Nginx SSL blocks

---

## Step 4 — Verify Auto-Renewal

Let's Encrypt certificates expire every 90 days. Certbot installs a systemd timer:

```bash
# Check the timer is active
sudo systemctl status certbot.timer

# Test dry-run renewal
sudo certbot renew --dry-run
```

---

## Step 5 — Update CORS_ORIGIN in `.env`

```bash
# Edit your .env file on the server
nano /path/to/ecommerce-app/.env
```

Update:
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Rebuild and restart:
```bash
docker compose up --build -d backend
```

---

## ✅ Verification Checklist

```bash
# Check SSL certificate
curl -I https://yourdomain.com

# Check HSTS header
curl -I https://yourdomain.com | grep -i strict-transport

# Check HTTP → HTTPS redirect
curl -I http://yourdomain.com
# Should see: HTTP/1.1 301 Moved Permanently

# Check API health via HTTPS
curl https://yourdomain.com/health

# Test with SSL Labs (full grade report)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

---

## 🔑 Quick Reference

| Task | Command |
|------|---------|
| Renew certificate manually | `sudo certbot renew` |
| Check certificate expiry | `sudo certbot certificates` |
| Reload Nginx | `sudo systemctl reload nginx` |
| View Nginx logs | `sudo tail -f /var/log/nginx/access.log` |
| View Nginx error logs | `sudo tail -f /var/log/nginx/error.log` |
