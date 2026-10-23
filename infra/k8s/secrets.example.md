# Kubernetes secrets — example only

Never commit a populated Secret manifest or put real credentials in Git.

```bash
kubectl create namespace save

# Generate a password out of band; avoid shell history when entering real secrets.
read -rsp 'PostgreSQL password: ' DB_PASSWORD; echo
kubectl -n save create secret generic save-postgres-secrets \
  --from-literal=POSTGRES_PASSWORD="$DB_PASSWORD"
unset DB_PASSWORD

# URL-encode any reserved characters in the password before constructing DATABASE_URL.
read -rsp 'Full DATABASE_URL: ' DATABASE_URL; echo
kubectl -n save create secret generic save-backend-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL"
unset DATABASE_URL
```

The example above creates secrets through the Kubernetes API but does not provide encryption-at-rest for etcd by itself. For production, enable Kubernetes secret encryption at rest and use a managed workflow such as SOPS/age or Sealed Secrets. Restrict RBAC access to these secrets.
