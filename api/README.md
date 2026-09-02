# vehicle-info-api

Wrapper API around the insurance company's `vehicle-info` webhook, built for
Part A of the ENCORE car insurance onboarding assignment. This service is
what the Insait flow (Part B) calls from its API node — it is not the raw
upstream endpoint. It also serves a small bilingual demo UI at `/` for
showing the lookup live.

## Why a wrapper instead of calling the upstream directly from the flow?

See `../report/index.html` for the full reasoning. In short: normalized
input (dashes/spaces stripped from plate numbers), and a stable success/error
contract keyed on both HTTP status and an `error.code` enum, so the flow's
API node can branch deterministically instead of parsing upstream error text.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:8080
```

- `/` — the demo UI (Hebrew/English toggle)
- `GET /health` — health check
- `POST /vehicle-info` — `{ "license_plate": "12345678" }`

The full API contract (request/response shapes, status codes) is documented
in `../docs/api-contract.yaml` (OpenAPI 3.0) — kept as a plain reference file
rather than a served Swagger UI, to keep this service to two dependencies
(`express`, `zod`).

## Test

```bash
npm test
```

15 tests cover: validation (7/8 digit rule, dash/space stripping, missing
field), the success path, upstream 404 → `VEHICLE_NOT_FOUND`, upstream 5xx →
`UPSTREAM_ERROR`, network failure → `UPSTREAM_UNAVAILABLE`, and config
fail-fast validation.

## Deploy — Render.com (free, simplest)

Render's free tier needs no credit card and no CLI — just a GitHub repo.

1. Push this project to a GitHub repository (create one at
   github.com/new, then `git remote add origin <url> && git push -u origin main`).
2. Go to [render.com](https://render.com) and sign up / log in with GitHub.
3. **New → Web Service** → pick this repo.
4. Render auto-detects `render.yaml` at the repo root and pre-fills
   everything (root dir `api`, build command, start command, env vars) — just
   click **Create Web Service**.
5. First deploy takes a couple of minutes. You'll get a URL like
   `https://vehicle-info-api.onrender.com`.

Note: on the free plan the service "sleeps" after ~15 minutes of no traffic
and takes a few seconds to wake on the next request — fine for a demo, just
hit it once before your interview/recording so it's warm.

Use that URL (+ `/vehicle-info`) as the endpoint in the Insait flow's API
node.

## Deploy — Google Cloud Run (alternative)

Kept for reference since it mirrors the given upstream's own platform.
Requires the `gcloud` CLI, authenticated, with a GCP project and billing
enabled:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
./deploy.sh          # or deploy.ps1 on Windows PowerShell
```

Builds the `Dockerfile` via Cloud Build and deploys it as a public Cloud Run
service. Grab the URL with:

```bash
gcloud run services describe vehicle-info-api --region us-central1 --format='value(status.url)'
```

## Response contract

Success (200):
```json
{ "success": true, "data": { "license_plate": "12345678", "manufacturer": "טויוטה", "model": "קורולה", "year": 2020, "color": "לבן" } }
```

Error (400 / 404 / 502 / 504):
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

`error.code` is one of `VALIDATION_ERROR` (400), `VEHICLE_NOT_FOUND` (404),
`UPSTREAM_ERROR` (502), `UPSTREAM_UNAVAILABLE` (504).

Note: the upstream service returns vehicle data in **Hebrew**
(manufacturer/model/color), not English — the PDF's example response was
illustrative only. This wrapper passes those values through unchanged.
