# WARZONE / CDL ESPORT

Site éditorial dédié à l'esport Call of Duty — Warzone compétitif & Call of Duty League / Black Ops 7.

Projet réalisé dans le cadre du titre professionnel **DWWM (Développeur Web et Web Mobile — Niveau 5)**.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Front-end | React 18, Vite, CSS Modules, React Router DOM v6, Axios |
| Back-end | Node.js, Express, architecture MVC |
| BDD | MySQL 8, Prisma ORM (schéma 3NF) |
| Auth | JWT, Bcrypt |
| Sécurité | Helmet.js, CORS restrictif, express-validator, rate-limiting |
| Scraping | Cheerio, Axios, node-cron |
| DevOps | Docker, docker-compose, nginx reverse proxy |
| Tests | Jest, Supertest |

---

## Architecture

```
/
├── client/                    # React 18 + Vite (SPA)
│   └── src/
│       ├── components/        # Navbar, Footer, ArticleCard, MetaTags, CustomCursor
│       ├── pages/             # Home, Warzone, CDL, Article, Admin (Login + Dashboard)
│       ├── styles/            # globals.css — design system éditorial
│       ├── hooks/             # useArticles, useAuth (Context)
│       └── utils/             # api.js (Axios), format.js
├── server/                    # Express API (REST)
│   ├── controllers/           # articleController, authController, teamController, matchController
│   ├── services/              # articleService, authService, teamService, matchService, scraperService
│   ├── routes/                # articles, auth, teams, matches, scraper
│   ├── middlewares/           # auth (JWT), validate (express-validator), rateLimit
│   ├── jobs/                  # scraperJob (node-cron)
│   └── prisma/                # schema.prisma, seed.js
├── nginx/                     # nginx.conf (reverse proxy HTTPS)
├── docker-compose.yml
├── DEPLOY.md
└── .env.example
```

---

## Installation rapide (développement)

```bash
# 1. Cloner
git clone <repo>
cd warzone-cdl-esport

# 2. Variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Base de données + seed
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Lancer le back-end
npm run dev   # http://localhost:3001

# 5. Lancer le front-end (nouveau terminal)
cd ../client
cp .env.example .env
npm install
npm run dev   # http://localhost:5173
```

---

## Déploiement Docker

Voir [DEPLOY.md](./DEPLOY.md) pour la procédure complète.

```bash
cp .env.example .env
# Remplir les variables
docker compose build && docker compose up -d
```

---

## API endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/articles` | — | Liste paginée avec filtres `category`, `page`, `limit` |
| GET | `/api/articles/:slug` | — | Article par slug |
| POST | `/api/articles` | Admin JWT | Créer un article |
| PUT | `/api/articles/:id` | Admin JWT | Modifier un article |
| DELETE | `/api/articles/:id` | Admin JWT | Supprimer un article |
| GET | `/api/teams` | — | Équipes par `category` |
| GET | `/api/teams/players` | — | Joueurs par `team_id` |
| GET | `/api/matches` | — | Matchs par `category` |
| POST | `/api/auth/login` | — | Authentification JWT |
| GET | `/api/auth/me` | JWT | Profil utilisateur |
| POST | `/api/scraper/trigger` | Admin JWT | Lancer un scraping manuel |
| GET | `/api/scraper/status` | Admin JWT | Statut du scraper |
| GET | `/api/health` | — | Santé de l'API |

---

## Sécurité

- **Helmet.js** : headers HTTP sécurisés (XSS, clickjacking, MIME sniffing)
- **CORS restrictif** : origines whitelistées via variable d'environnement
- **JWT** : tokens signés, expiration configurable, stockés en localStorage
- **Bcrypt** (factor 12) : mots de passe hashés
- **express-validator** : validation et sanitisation de toutes les entrées
- **Rate limiting** : 5 tentatives de login / 15 min, 200 req/min global
- **Prisma** : requêtes paramétrées, protection injection SQL native
- **HTTPS** via nginx reverse proxy (TLS 1.2/1.3)
- Variables sensibles en `.env`, jamais en dur dans le code

---

## Direction artistique

Inspiration : **glitchandgrit.com** — design éditorial agressif.

- Typographie : Bebas Neue (titres), Inter (corps), JetBrains Mono (mono)
- Palette : `#000000` noir pur / `#F2F0EB` blanc cassé / `#C8FF00` accent warzone / `#FF3A1A` accent CDL
- Zéro gradient, zéro border-radius mou, zéro layout symétrique
- Images en noir & blanc (filtre `grayscale`)
- Curseur personnalisé, animations `transform translate`

---

## Tests

```bash
cd server
npm test
```

Couvre :
- `articleService.slugify()` — transformation en slug
- API `GET /api/articles` — liste et pagination
- API `GET /api/articles/:slug` — 404 pour slug inexistant
- API `POST /api/auth/login` — 401 pour mauvais identifiants
- API `POST /api/articles` — 401 sans token JWT

---

## Conformité DWWM

| Critère | Implémentation |
|---------|---------------|
| Front-end sécurisé | Validation formulaires, protection XSS, headers Helmet |
| Back-end MVC | routes / controllers / services / models strict |
| BDD relationnelle 3NF | MySQL, Prisma, relations FK |
| Composants métier | Scraper, CRUD admin, authentification JWT |
| Déploiement documenté | DEPLOY.md, docker-compose, nginx |
| Tests | Jest unitaires + Supertest API |
| SEO | MetaTags dynamiques, sitemap, robots.txt, balises sémantiques |
| Accessibilité | ARIA, contraste WCAG AA, navigation clavier, alt images |
| RGPD | Mentions légales, zéro cookie tiers, footer conforme |
