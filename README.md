# Save — monorepo scaffold

Save is a private document and WhatsApp-export vault for SmartTifoli:
- `apps/backend`: NestJS + TypeScript REST API, Drizzle ORM, PostgreSQL.
- `apps/frontend`: Expo + React Native + React Native Web (one UI codebase for web/iOS/Android).
- `packages/contracts`: shared API contracts.
- `infra/k8s`: Kubernetes templates for k3s/ARM64.
- `scripts/diagnose-storage.sh`: read-only storage/protocol diagnostics.

> **Important:** this is a secure-oriented starting scaffold, not a production-ready vault yet. Authentication, authorization enforcement, uploads, malware scanning, WhatsApp parsing, backup/restore and rate limiting must be implemented and tested before exposing it publicly. The API currently exposes health/readiness endpoints only. Do not publish it to the Internet until the security checklist is complete.

## Architecture

- Web: `https://save.shamdani.fr`
- API: `https://api-save.shamdani.fr/api/v1` (recommended separate origin)
- API owns all business rules and file access. The frontend must never access PostgreSQL or the storage filesystem directly.
- Store document bytes on a dedicated persistent volume on the Raspberry Pi that physically owns the disk; store metadata in PostgreSQL.
- Use SFTP only if diagnostics confirm it is already available and appropriate. Prefer a local Kubernetes PV when the disk is mounted on a k3s node and the workload can be pinned to that node.
- Do not format disks, alter mounts, or create directories until the diagnostic output has been reviewed.

## Requirements

- Node.js 22 LTS, pnpm 9+, Docker/Buildx.
- Kubernetes/k3s access and `kubectl` configured against the cluster.
- A container registry reachable by all cluster nodes, with ARM64 images.
- Existing Traefik ingress and cert-manager/OVH setup (verify actual ClusterIssuer name before applying).
- A storage path and node name confirmed by the read-only diagnostic.

## Local development

```bash
corepack enable
pnpm install
cp apps/backend/.env.example apps/backend/.env
# Edit the local .env values; never commit secrets.
pnpm dev:backend
# In another terminal:
pnpm dev:frontend
```

Backend default local URL: `http://localhost:3000/api/v1/health`
Frontend: Expo will print the local web URL. To test the web client use `pnpm --filter @save/frontend web`.

The current backend health endpoint does not require PostgreSQL yet. DB wiring is scaffolded in `apps/backend/src/database`.

## Storage diagnosis (read-only)

Run on each Pi (`tifoli`, `tifoli3`, `tifoli4`) and retain output for review:

```bash
bash scripts/diagnose-storage.sh
```

On `tifoli3`, also run:

```bash
kubectl get nodes -o wide
kubectl get storageclass
kubectl get pv,pvc -A
```

The diagnostic script only reads system state. Review output for sensitive paths/hostnames before sharing. Do not include passwords or private keys.

## Build and test

```bash
pnpm lint
pnpm test
pnpm build
```

Build images for ARM64 (replace registry/namespace with your real values):

```bash
docker buildx build --platform linux/arm64 \
  -f apps/backend/Dockerfile \
  -t REGISTRY/ save-backend:dev --load .
```

The command above is a template: replace it with a valid registry/image tag, for example:
`registry.example.invalid/home/save-backend:0.1.0`. For a remote registry, omit `--load` and use `--push`.

Frontend web production output is built with Expo:
```bash
pnpm --filter @save/frontend export:web
```

## Kubernetes deployment — do not apply until storage/DNS/cert issuer are verified

1. Confirm the actual node name and the disk mount path from the diagnostic output.
2. Create a dedicated directory on the confirmed mounted disk only after reviewing it; set ownership/permissions for the selected non-root UID.
3. Copy `infra/k8s/storage/pv-local.template.yaml` to a private working file and replace every `REPLACE_*` placeholder. It is intentionally not deployable as-is.
4. Verify the actual cert-manager ClusterIssuer name and DNS records for both hostnames.
5. Build and push **both** ARM64 images, then set image tags in the deployments.
6. Create a Kubernetes Secret out-of-band. Do not commit a populated Secret manifest:
   ```bash
   kubectl create namespace save
   kubectl -n save create secret generic save-backend-secrets \
     --from-literal=DATABASE_URL='postgresql://save_app:REPLACE_PASSWORD@save-postgres:5432/save'
   ```
   Use a generated strong password and URL-encode reserved characters in the connection string. Prefer a secret manager/SOPS/Sealed Secrets for repeatable production deployment.
7. Review every manifest and placeholder, then apply:
   ```bash
   kubectl apply -f infra/k8s/00-namespace.yaml
   kubectl apply -f infra/k8s/storage/pv-local.yaml
   kubectl apply -f infra/k8s/postgres.yaml
   kubectl apply -f infra/k8s/backend.yaml
   kubectl apply -f infra/k8s/frontend.yaml
   kubectl apply -f infra/k8s/ingress.template.yaml
   ```
   Rename the reviewed ingress template to `ingress.yaml` and replace its placeholders first.
8. Verify:
   ```bash
   kubectl -n save get pods,svc,pvc
   kubectl -n save logs deploy/save-backend
   kubectl -n save port-forward svc/save-backend 3000:3000
   curl -fsS http://127.0.0.1:3000/api/v1/health
   ```
9. Do not route public traffic to the service until authentication, authorization, uploads, audit, rate limits, backups and restore tests are complete.

## Security release checklist

- [ ] Real authentication implemented; admin bootstrap is controlled and cannot be self-registered.
- [ ] RBAC + per-object ownership checks enforced in backend services.
- [ ] Web session cookies: Secure, HttpOnly, SameSite; CSRF controls if cookie-auth is used.
- [ ] Mobile authentication uses short-lived access tokens and securely stored refresh credentials (Keychain/Keystore).
- [ ] Rate limiting, account lockout/backoff, MFA for administrators.
- [ ] Upload limits, MIME/content validation, archive traversal/bomb defenses, random storage filenames.
- [ ] Malware scanning/quarantine and no inline execution of uploaded content.
- [ ] Audit events for sensitive actions, without logging passwords/tokens/message contents.
- [ ] PostgreSQL backup and file backup are independent, encrypted, off-node and restore-tested.
- [ ] NetworkPolicies actually enforced by the cluster CNI; otherwise do not claim isolation.
- [ ] TLS issuer and DNS records verified; API CORS allowlist contains only the real frontend origins.
- [ ] Dependency and image scans; run containers as non-root; resource requests/limits set.
- [ ] Privacy review for WhatsApp messages and media; access and retention rules defined.

## Planned milestones

1. Infrastructure discovery and storage decision.
2. API/auth/roles/database migrations.
3. Document upload/download and audit.
4. WhatsApp export ingestion preserving originals.
5. Expo web/mobile UI.
6. Deployment, monitoring, backup/restore and security testing.
