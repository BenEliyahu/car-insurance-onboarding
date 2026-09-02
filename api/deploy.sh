#!/usr/bin/env bash
# Deploys the vehicle-info wrapper API to Google Cloud Run.
# Prerequisites: gcloud CLI installed and authenticated (gcloud auth login),
# and a GCP project selected (gcloud config set project YOUR_PROJECT_ID).
set -euo pipefail

SERVICE_NAME="vehicle-info-api"
REGION="us-central1"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars UPSTREAM_URL=https://insurance-webhook-945894769129.us-central1.run.app/vehicle-info,UPSTREAM_TIMEOUT_MS=5000,UPSTREAM_RETRIES=1,LOG_LEVEL=info

echo ""
echo "Deployed. Fetch the service URL with:"
echo "  gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'"
