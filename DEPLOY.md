# Procédure de déploiement — WARZONE / CDL ESPORT

## 1. Prérequis

| Outil | Version minimale |
|-------|----------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Docker | 24.x |
| Docker Compose | v2.x |
| MySQL | 8.0 (si déploiement sans Docker) |
| Git | 2.x |

---

## 2. Variables d'environnement

Copier `.env.example` en `.env` à la racine et remplir toutes les valeurs :

```bash
cp .env.example .env
```

Variables obligatoires :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL complète MySQL (ex: `mysql://user:pass@localhost:3306/warzone_cdl`) |
| `JWT_SECRET` | Chaîne aléatoire ≥ 32 caractères (générer avec `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | Email de l'admin initial |
| `ADMIN_PASSWORD` | Mot de passe admin (≥ 12 chars, maj + min + chiffre) |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL (Docker uniquement) |
| `MYSQL_DATABASE` | Nom de la base |
| `MYSQL_USER` | Utilisateur MySQL |
| `MYSQL_PASSWORD` | Mot de passe utilisateur MySQL |
| `ALLOWED_ORIGINS` | Origines CORS autorisées (ex: `https://warzone-cdl.fr`) |

---

## 3. Build step by step

### 3a. Avec Docker (recommandé)

```bash
# 1. Construire les images
docker compose build

# 2. Lancer les services
docker compose up -d

# 3. Vérifier les logs
docker compose logs -f app

# 4. Vérifier que l'API répond
curl https://localhost/api/health
```

### 3b. Sans Docker (développement local)

```bash
# 1. Installer les dépendances
cd server && npm install
cd ../client && npm install

# 2. Générer le client Prisma
cd server && npx prisma generate

# 3. Appliquer les migrations
cd server && npx prisma migrate deploy

# 4. Seeder la base (admin + données initiales)
cd server && npm run db:seed

# 5. Lancer le back (port 3001)
cd server && npm run dev

# 6. Lancer le front (port 5173)
cd client && npm run dev

# 7. Build front pour production
cd client && npm run build
```

### 3c. Build front uniquement

```bash
cd client
cp .env.example .env
# Remplir VITE_API_URL avec l'URL de prod
npm run build
# Les fichiers sont dans client/dist/
```

---

## 4. Génération du certificat SSL self-signed (dev)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

---

## 5. Procédure de mise à jour

```bash
# 1. Récupérer les changements
git pull origin main

# 2. Reconstruire les images si le Dockerfile a changé
docker compose build app

# 3. Appliquer les nouvelles migrations BDD
docker compose exec app npx prisma migrate deploy

# 4. Rebuild le front si des fichiers client ont changé
cd client && npm run build

# 5. Redémarrer les services
docker compose up -d --no-deps app nginx

# 6. Vérifier les logs
docker compose logs -f app --tail 50
```

---

## 6. Rollback

```bash
# 1. Revenir au commit précédent
git log --oneline -5    # noter le hash
git checkout <hash>

# 2. Reconstruire
docker compose build app
docker compose up -d --no-deps app

# 3. Si migration BDD nécessaire (rollback schema)
docker compose exec app npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 7. Sauvegarde MySQL

### Sauvegarde manuelle

```bash
# Dans le conteneur
docker compose exec db mysqldump \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} \
  ${MYSQL_DATABASE} > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Sauvegarde automatique (cron)

Ajouter dans le crontab du serveur host :

```cron
0 3 * * * docker compose -f /path/to/docker-compose.yml exec -T db mysqldump \
  -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE \
  > /backups/warzone_cdl_$(date +\%Y\%m\%d).sql 2>/dev/null
```

### Restauration

```bash
docker compose exec -T db mysql \
  -u${MYSQL_USER} -p${MYSQL_PASSWORD} \
  ${MYSQL_DATABASE} < backup_20241201_030000.sql
```

---

## 8. Vérification post-déploiement

```bash
# Santé de l'API
curl https://votre-domaine.fr/api/health

# Articles disponibles
curl https://votre-domaine.fr/api/articles?limit=3

# Test de l'authentification admin
curl -X POST https://votre-domaine.fr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warzone-cdl.fr","password":"votre-password"}'
```

---

## 9. Commandes utiles

```bash
# Voir l'état des services
docker compose ps

# Voir les logs en temps réel
docker compose logs -f

# Entrer dans le conteneur app
docker compose exec app sh

# Prisma Studio (interface BDD)
docker compose exec app npx prisma studio

# Forcer un scraping
curl -X POST https://votre-domaine.fr/api/scraper/trigger \
  -H "Authorization: Bearer <token_admin>"
```
