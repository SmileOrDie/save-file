# Save

Coffre documentaire personnel sécurisé.

## Architecture

- Application : déployée dans Kubernetes (k3s).
- Base de données : PostgreSQL, service interne uniquement.
- Documents : stockage persistant sur tifoli.
- Code source : GitHub, dépôt SmileOrDie/save-file.

## Sécurité

- Aucun secret dans le dépôt Git.
- PostgreSQL n'est pas exposé sur Internet.
- Authentification et autorisation côté serveur.
- Accès externe uniquement via des routes publiques explicitement autorisées.
