# Guide de déploiement — CodPulse

## Architecture

```
projet/
├── client/          # React 19 + Vite (port 5173 dev / dist/ en prod)
├── server/          # Node.js + Express + Prisma (port 3001)
└── server/prisma/   # Schéma MySQL + migrations
```

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| MySQL | 8.0+ |
| Git | 2.x |

---

## Installation locale (développement)

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd "projet esport call of warzone bo7 cdl"
```

### 2. Configurer les variables d'environnement

```bash
cp server/.env.example server/.env
# Ouvrir server/.env et renseigner les valeurs
```

Variables obligatoires :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Chaîne de connexion MySQL | `mysql://root:@localhost:3306/warzone_cdl` |
| `JWT_SECRET` | Clé secrète JWT (min. 32 chars) | `mon_secret_tres_long_et_aleatoire` |
| `JWT_EXPIRES_IN` | Durée de validité du token | `7d` |
| `PORT` | Port du serveur Express | `3001` |
| `ALLOWED_ORIGINS` | Origines CORS autorisées | `http://localhost:5173` |
| `ADMIN_EMAIL` | Email du compte admin initial | `admin@cod-pulse.fr` |
| `ADMIN_PASSWORD` | Mot de passe admin initial | `MotDePasse123!` |

Variables optionnelles :

| Variable | Description |
|----------|-------------|
| `TWITCH_CLIENT_ID` | API Twitch (page Live) |
| `TWITCH_CLIENT_SECRET` | API Twitch |
| `TRN_API_KEY` | Tracker.gg (Top 250) |

### 3. Installer les dépendances

```bash
# Serveur
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Initialiser la base de données

```bash
cd server

# Générer le client Prisma
npx prisma generate

# Créer les tables (sans migration)
npx prisma db push

# Injecter les données de seed (compte admin + données initiales)
npx prisma db seed
```

> La commande `db seed` crée automatiquement le compte admin avec les identifiants définis dans `ADMIN_EMAIL` et `ADMIN_PASSWORD`.

### 5. Lancer les serveurs

```bash
# Terminal 1 — API
cd server && npm run dev      # nodemon, hot reload

# Terminal 2 — Front
cd client && npm run dev      # Vite, HMR
```

- Front-end : [http://localhost:5173](http://localhost:5173)
- API : [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## Lancer les tests

```bash
cd server
npm test
# Jest — 2 suites, ~20 tests
```

---

## Production

### Build du front-end

```bash
cd client
npm run build
# Génère client/dist/ — fichiers statiques optimisés
```

### Servir les fichiers statiques depuis Express (optionnel)

Dans `server/index.js`, ajouter :

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### Démarrer en production

```bash
cd server
NODE_ENV=production node index.js
```

---

## Déploiement sur un VPS (exemple Ubuntu 22.04)

### 1. Préparer le serveur

```bash
# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Installer PM2 (process manager)
sudo npm install -g pm2
```

### 2. Configurer MySQL

```sql
CREATE DATABASE warzone_cdl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'codpulse'@'localhost' IDENTIFIED BY 'VotreMotDePasse!';
GRANT ALL PRIVILEGES ON warzone_cdl.* TO 'codpulse'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Déployer l'application

```bash
git clone <url> /var/www/codpulse
cd /var/www/codpulse/server
cp .env.example .env    # renseigner les vraies valeurs
npm install --production
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Build front + configurer Nginx

```bash
cd /var/www/codpulse/client
npm install && npm run build
```

Config Nginx `/etc/nginx/sites-available/codpulse` :

```nginx
server {
    listen 80;
    server_name votre-domaine.fr;

    # Front-end React (SPA)
    root /var/www/codpulse/client/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Express
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 5. Lancer avec PM2

```bash
cd /var/www/codpulse/server
pm2 start index.js --name "codpulse-api"
pm2 startup
pm2 save
```

---

## Variables d'environnement de production

En production, ne jamais stocker les secrets dans le code. Utiliser :
- Un fichier `.env` hors du dépôt git
- Ou des variables d'environnement système : `export JWT_SECRET=...`
- Ou un gestionnaire de secrets (Vault, AWS Secrets Manager)

Le fichier `.env` est listé dans `.gitignore` et ne doit **jamais** être committé.

---

## Structure de la base de données (résumé)

| Table | Description |
|-------|-------------|
| `articles` | Actualités Warzone / CDL |
| `teams` | Équipes esport |
| `players` | Joueurs professionnels |
| `match_results` | Résultats des matchs CDL |
| `users` | Comptes admin/editor |
| `leaderboard_entries` | Classement Top 250 |
| `weapons` | Armes meta Warzone |
| `sync_logs` | Journal des synchronisations |
