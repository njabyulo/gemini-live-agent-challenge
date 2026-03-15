# Runtime Code Executor Deployment Guide

## Scope

Deploy `apps/runner-code-executor` to Google Cloud Run as the internal Python execution backend.

## Infra Source of Truth

- `infra/apps/runner-code-executor/cloudrun.yaml`
- `infra/apps/runner-code-executor/Dockerfile`

Current production service:

- `gemini-live-agent-prod-run-runner-backend-00`

Current runtime identity:

- `419058482352-compute@developer.gserviceaccount.com`

## GCP Auth

Authenticate and target the correct project before deploying:

```bash
gcloud auth login
gcloud config set project "$GOOGLE_CLOUD_PROJECT"
gcloud config set run/region "${GOOGLE_CLOUD_REGION:-us-central1}"
```

Then enable the required Google APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  --project "$GOOGLE_CLOUD_PROJECT"
```

Create the Artifact Registry repository once if it does not exist yet:

```bash
gcloud artifacts repositories create gemini-live-agent \
  --project "$GOOGLE_CLOUD_PROJECT" \
  --location=us \
  --repository-format=docker \
  --description="gemini-live-agent Cloud Run images"
```

The checked-in Cloud Run manifest explicitly pins the service account so future secret-backed runner config can be granted to a predictable identity.

## Required Environment

1. `GOOGLE_CLOUD_PROJECT`
2. `GOOGLE_CLOUD_REGION`
3. `RUNNER_EXECUTION_TIMEOUT_MS`
4. `RUNNER_MAX_STDIO_BYTES`

Do not set `PORT` in `cloudrun.yaml`.

Why:

- Cloud Run injects `PORT` automatically
- explicitly setting it causes the deploy to fail

## Runtime Config

Set or update the non-secret runtime vars after the service exists:

```bash
gcloud run services update gemini-live-agent-prod-run-runner-backend-00 \
  --region="${GOOGLE_CLOUD_REGION:-us-central1}" \
  --update-env-vars=RUNNER_EXECUTION_TIMEOUT_MS=10000,RUNNER_MAX_STDIO_BYTES=65536
```

Recommended default:

- keep this service off public DNS
- let `apps/api` call the Cloud Run service URL directly through `RUNNER_CODE_EXECUTOR_BASE_URL`
- do not add a public custom hostname unless there is a concrete operational need

Only add a public hostname if there is a concrete need.

## Build And Push The Image

The current `pnpm release:runner-code-executor` script only replaces the Cloud Run service.
It does not build and push the container image first.

Build and push the image before replacing the service:

```bash
tmpfile=$(mktemp /tmp/runner-code-executor-cloudbuild.XXXXXX)
cat > "$tmpfile" <<'YAML'
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -f
      - infra/apps/runner-code-executor/Dockerfile
      - -t
      - us-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/gemini-live-agent/runner-code-executor:latest
      - .
images:
  - us-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/gemini-live-agent/runner-code-executor:latest
YAML
gcloud builds submit --project "$GOOGLE_CLOUD_PROJECT" --config "$tmpfile" .
rm -f "$tmpfile"
```

The image path expected by Cloud Run is:

```txt
us-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/gemini-live-agent/runner-code-executor:latest
```

Important implementation note:

- the runner image uses Debian Bookworm
- install `pytest` with `apt` via `python3-pytest`
- do not use `pip install pytest` in this image
  - it fails under PEP 668 in this base image

## Local Validation Before Deploy

```bash
pnpm --filter runner-code-executor lint
pnpm --filter runner-code-executor test
pnpm --filter runner-code-executor build
```

## Deploy

### Dev

```bash
pnpm release:dev:runner-code-executor
```

### Production

```bash
pnpm release:runner-code-executor
```

If `gcloud run services replace` does not substitute `${GOOGLE_CLOUD_PROJECT}` in the YAML for your shell flow, render a temporary manifest first:

```bash
tmpfile=$(mktemp /tmp/runner-code-executor-service.XXXXXX.yaml)
perl -pe "s/\\$\\{GOOGLE_CLOUD_PROJECT\\}/$GOOGLE_CLOUD_PROJECT/g" \
  infra/apps/runner-code-executor/cloudrun.yaml > "$tmpfile"
gcloud run services replace "$tmpfile" --project "$GOOGLE_CLOUD_PROJECT" --region "${GOOGLE_CLOUD_REGION:-us-central1}"
rm -f "$tmpfile"
```

## Default Endpoint

Default production endpoint:

- `https://<runner-code-executor-service>.a.run.app`

`apps/api` should use that Cloud Run URL directly through `RUNNER_CODE_EXECUTOR_BASE_URL`.

## Optional Public Hostname

If the runner ever needs a public hostname later, treat that as a separate infrastructure task.

Current recommendation:

- keep `apps/runner-code-executor` on its Google-provided `run.app` URL
- do not expose it on a public custom hostname by default
- point `RUNNER_CODE_EXECUTOR_BASE_URL` at the Cloud Run service URL unless you intentionally decide otherwise

## Post-Deploy Checks

1. `GET /health` returns `200`
2. `POST /execute` runs `python3 main.py ...` successfully
3. `POST /execute` returns stdout/stderr JSON
4. `apps/api` can reach the deployed runner URL configured in `RUNNER_CODE_EXECUTOR_BASE_URL`
5. If `/health` returns `403`, make the service publicly invokable:

```bash
gcloud run services add-iam-policy-binding gemini-live-agent-prod-run-runner-backend-00 \
  --project "$GOOGLE_CLOUD_PROJECT" \
  --region "${GOOGLE_CLOUD_REGION:-us-central1}" \
  --member="allUsers" \
  --role="roles/run.invoker"
```
