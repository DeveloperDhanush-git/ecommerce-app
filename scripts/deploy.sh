#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Zero-downtime production deploy for Ecommerce App on EC2
#
# Usage (from project root on EC2):
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
#
# What it does:
#   1. Pulls latest code from git
#   2. Validates .env exists and has no placeholder secrets
#   3. Rebuilds Docker images
#   4. Performs rolling container replacement (minimises downtime)
#   5. Verifies health check passes
#   6. Prunes old Docker images to free disk
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
LOG_FILE="${PROJECT_DIR}/deploy.log"
HEALTH_URL="http://localhost/health"
MAX_HEALTH_RETRIES=30
HEALTH_INTERVAL=3

# ── Logging ───────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"; }
ok()   { log "✅ $*"; }
warn() { log "⚠️  $*"; }
fail() { log "❌ $*"; exit 1; }

log "══════════════════════════════════════════"
log "Deploy started"
log "══════════════════════════════════════════"

cd "${PROJECT_DIR}"

# ── Step 1: Validate .env ─────────────────────────────────────────────────────
log "Checking .env…"
[[ -f .env ]] || fail ".env file not found. Run: cp .env.example .env and fill in secrets."

# Fail if any placeholder values exist
PLACEHOLDERS=("REPLACE_WITH" "mySuperSecretKey" "rootpassword123" "password123" "changeme")
for placeholder in "${PLACEHOLDERS[@]}"; do
  if grep -q "${placeholder}" .env 2>/dev/null; then
    fail ".env still contains placeholder value '${placeholder}'. Set real secrets before deploying."
  fi
done
ok ".env validated — no placeholder secrets found"

# ── Step 2: Pull latest code ──────────────────────────────────────────────────
log "Pulling latest code from git…"
git pull --ff-only origin main 2>&1 | tee -a "${LOG_FILE}" || \
  fail "git pull failed. Resolve conflicts manually."
ok "Code updated"

# ── Step 3: Rebuild Docker images ─────────────────────────────────────────────
log "Building Docker images (no cache)…"
docker compose build --no-cache --pull 2>&1 | tee -a "${LOG_FILE}"
ok "Images built"

# ── Step 4: Rolling container replacement ─────────────────────────────────────
log "Bringing up new containers…"
docker compose up -d --remove-orphans 2>&1 | tee -a "${LOG_FILE}"
ok "Containers started"

# ── Step 5: Health check ──────────────────────────────────────────────────────
log "Waiting for health check at ${HEALTH_URL}…"
RETRIES=0
until curl -fsS "${HEALTH_URL}" > /dev/null 2>&1; do
  RETRIES=$((RETRIES + 1))
  if [[ ${RETRIES} -ge ${MAX_HEALTH_RETRIES} ]]; then
    log "Health check failed after $((MAX_HEALTH_RETRIES * HEALTH_INTERVAL))s"
    log "Container logs:"
    docker compose logs --tail=50 backend | tee -a "${LOG_FILE}"
    fail "Deploy failed — rolling service is unhealthy"
  fi
  log "  Health check attempt ${RETRIES}/${MAX_HEALTH_RETRIES}…"
  sleep "${HEALTH_INTERVAL}"
done
ok "Health check passed"

# ── Step 6: Prune old images ──────────────────────────────────────────────────
log "Pruning dangling Docker images…"
docker image prune -f 2>&1 | tee -a "${LOG_FILE}"
ok "Docker cleanup complete"

log "══════════════════════════════════════════"
log "Deploy completed successfully 🚀"
log "══════════════════════════════════════════"
