# Deploys the vehicle-info wrapper API to Google Cloud Run.
# Prerequisites: gcloud CLI installed and authenticated (gcloud auth login),
# and a GCP project selected (gcloud config set project YOUR_PROJECT_ID).

$ServiceName = "vehicle-info-api"
$Region = "us-central1"

gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --allow-unauthenticated `
  --port 8080 `
  --set-env-vars "UPSTREAM_URL=https://insurance-webhook-945894769129.us-central1.run.app/vehicle-info,UPSTREAM_TIMEOUT_MS=5000,UPSTREAM_RETRIES=1,LOG_LEVEL=info"

Write-Host ""
Write-Host "Deployed. Fetch the service URL with:"
Write-Host "  gcloud run services describe $ServiceName --region $Region --format=`"value(status.url)`""
