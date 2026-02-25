# 📊 Monitoring Setup Guide

> **Goal**: Know when your app is down *before* your users do.

---

## 1. Uptime Monitoring — UptimeRobot (Free)

Pings your `/health` endpoint every 5 minutes and sends email/SMS alerts on downtime.

### Setup
1. Go to [uptimerobot.com](https://uptimerobot.com) → Create free account
2. **Add New Monitor**:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Ecommerce API`
   - URL: `https://yourdomain.com/health`
   - Monitoring Interval: `5 minutes`
3. Add an **alert contact** (email / Telegram / Slack webhook)
4. ✅ You'll get notified within 5 minutes of any outage

---

## 2. AWS CloudWatch — EC2 Instance Metrics

Monitor CPU, memory, and disk from the AWS Console.

### Enable Detailed EC2 Monitoring
```bash
# From AWS CLI — enable 1-minute granularity (vs default 5-min)
aws ec2 monitor-instances --instance-ids i-xxxxxxxxxxxxxxxxx
```

### Install CloudWatch Agent (Memory + Disk metrics)
```bash
# Download
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure (interactive wizard)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

Minimal config (`/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`):
```json
{
  "metrics": {
    "namespace": "EcommerceApp",
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["/", "/var/lib/docker"],
        "metrics_collection_interval": 300
      }
    }
  }
}
```

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

### CloudWatch Alarms to Create

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPUUtilization | > 80% for 5 min | Email SNS alert |
| mem_used_percent | > 85% for 5 min | Email SNS alert |
| disk_used_percent | > 80% | Email SNS alert |
| StatusCheckFailed | ≥ 1 | Email + auto-recover |

---

## 3. Docker Container Health Monitoring

```bash
# Watch all container statuses in real-time
watch -n 5 'docker compose ps'

# View live resource usage (CPU/Memory per container)
docker stats

# View structured logs with timestamps
docker compose logs -f --timestamps backend
```

### Log Shipping to CloudWatch Logs (Production)

In `docker-compose.yml`, update the backend logging driver:

```yaml
backend:
  logging:
    driver: awslogs
    options:
      awslogs-group: /ecommerce/backend
      awslogs-region: ap-south-1       # Change to your region
      awslogs-stream: backend
      awslogs-create-group: "true"
```

> Requires the EC2 instance to have an IAM Role with `CloudWatchLogsFullAccess` policy.

---

## 4. Application Error Tracking — Sentry (Free Tier)

Captures JavaScript errors with full stack traces, request context, and user info.

### Backend Setup
```bash
cd ecommerce-backend
npm install @sentry/node
```

Add to the **top** of `server.js`:
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of requests for performance monitoring
});

// Must be before any routes
app.use(Sentry.Handlers.requestHandler());
```

Add **after** all routes (before the custom error handler):
```javascript
app.use(Sentry.Handlers.errorHandler());
```

Add `SENTRY_DSN` to `.env`:
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 5. Disk Space Alerting (Simple Cron)

```bash
# Add to crontab — check disk every hour, alert if > 80%
crontab -e
```

Add:
```cron
0 * * * * DISK=$(df / | awk 'NR==2 {print $5}' | tr -d '%'); [ "$DISK" -gt 80 ] && echo "⚠️ Disk usage at ${DISK}% on $(hostname)" | mail -s "Disk Alert" your@email.com
```

---

## 6. Quick Health Dashboard (One-liner)

```bash
# Paste this alias in ~/.bashrc for a quick status check
alias ecom-status='echo "=== Containers ===" && docker compose ps && echo "" && echo "=== Health ===" && curl -s http://localhost/health | python3 -m json.tool && echo "" && echo "=== Resources ===" && docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"'

source ~/.bashrc
ecom-status
```

---

## Monitoring Priority Order

| Priority | Tool | Cost | Setup Time |
|----------|------|------|-----------|
| ⭐ First | UptimeRobot | Free | 5 minutes |
| ⭐ Second | CloudWatch Alarms | ~$1/month | 30 minutes |
| ⭐ Third | Sentry | Free (5K events/month) | 20 minutes |
| Optional | CloudWatch Logs Agent | ~$0.50/GB | 45 minutes |
