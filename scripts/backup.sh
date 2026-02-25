#!/usr/bin/env bash
# =============================================================================
# backup.sh — MySQL + Docker Volume backup for Ecommerce App
#
# Usage:
#   chmod +x backup.sh
#   ./backup.sh                        # Run manually
#   0 2 * * * /path/to/backup.sh       # Add to crontab (runs daily at 2 AM)
#
# Requirements: docker, aws-cli (for S3 upload)
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
BACKUP_DIR="/var/backups/ecommerce"
RETAIN_DAYS=7                          # Keep last 7 days of backups locally
S3_BUCKET="${S3_BACKUP_BUCKET:-}"      # Optional: set S3_BACKUP_BUCKET in env
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mysql_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# ── Load env vars (DB credentials) ───────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${SCRIPT_DIR}/.env" ]]; then
  # shellcheck disable=SC1091
  set -a; source "${SCRIPT_DIR}/.env"; set +a
fi

: "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is not set}"
: "${DB_NAME:?DB_NAME is not set}"

# ── Setup ────────────────────────────────────────────────────────────────────
mkdir -p "${BACKUP_DIR}"
exec >> "${LOG_FILE}" 2>&1

echo "────────────────────────────────────────────"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup started"

# ── MySQL dump via Docker ─────────────────────────────────────────────────────
echo "[INFO] Dumping MySQL database: ${DB_NAME}"

docker exec ecommerce_mysql \
  mysqldump \
    --user=root \
    --password="${MYSQL_ROOT_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --hex-blob \
    "${DB_NAME}" \
  | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "[INFO] Backup saved: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ── Upload to S3 (optional) ───────────────────────────────────────────────────
if [[ -n "${S3_BUCKET}" ]]; then
  echo "[INFO] Uploading to S3: s3://${S3_BUCKET}/mysql/"
  aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/mysql/" \
    --storage-class STANDARD_IA \
    --no-progress
  echo "[INFO] S3 upload complete"
fi

# ── Prune old local backups ───────────────────────────────────────────────────
echo "[INFO] Removing backups older than ${RETAIN_DAYS} days"
find "${BACKUP_DIR}" -name "mysql_*.sql.gz" -mtime +${RETAIN_DAYS} -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed successfully ✅"
echo "────────────────────────────────────────────"
