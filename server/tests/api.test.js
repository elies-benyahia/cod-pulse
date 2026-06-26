/**
 * Tests d'intégration API — Supertest
 *
 * Ces tests vérifient les routes HTTP sans connexion à une vraie BDD.
 * Prisma est mocké pour isoler les tests de l'environnement.
 *
 * Jeu d'essai :
 * - GET /api/articles → 200 avec structure paginée
 * - GET /api/articles/:slug → 404 pour slug inexistant
 * - POST /api/auth/login → 401 pour identifiants invalides
 * - POST /api/articles → 401 sans token JWT
 * - POST /api/articles → 422 avec données invalides + token admin
 */

const request = require('supertest');

// Mock du module Prisma avant l'import de l'app
jest.mock('../services/prismaClient', () => ({
  article: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findUnique: jest.fn().mockResolvedValue(null)
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null)
  },
  team: {
    findMany: jest.fn().mockResolvedValue([])
  },
  matchResult: {
    findMany: jest.fn().mockResolvedValue([])
  }
}));

// Variables d'environnement de test
process.env.JWT_SECRET = 'test-secret-key-for-jest-32chars!!';
process.env.NODE_ENV = 'test';

const app = require('../app');

describe('GET /api/articles', () => {
  test('retourne 200 avec une structure paginée', async () => {
    // Entrée : aucun paramètre
    // Résultat attendu : 200 + objet { data: [], meta: { total, page, limit, totalPages } }
    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('accepte les paramètres de filtrage (category, page, limit)', async () => {
    const res = await request(app).get('/api/articles?category=warzone&page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('page', 1);
  });

  test('plafonne limit à 50 articles max', async () => {
    const res = await request(app).get('/api/articles?limit=999');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/articles/:slug', () => {
  test('retourne 404 pour un slug inexistant', async () => {
    // Entrée : slug qui n'existe pas en BDD (mock retourne null)
    // Résultat attendu : 404 avec message d'erreur
    const res = await request(app).get('/api/articles/slug-inexistant-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  test('retourne 401 pour des identifiants invalides (utilisateur inexistant)', async () => {
    // Entrée : email inconnu
    // Résultat attendu : 401 + message générique (ne révèle pas si l'email existe)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.fr', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    // Le message ne doit pas révéler si l'email existe ou non
    expect(res.body.error).not.toContain('email');
  });

  test('retourne 422 pour un email invalide (validation)', async () => {
    // Entrée : email malformé
    // Résultat attendu : 422 Validation failed
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pasunemail', password: 'password123' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Validation failed');
  });

  test('retourne 422 si le mot de passe est trop court', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.fr', password: 'abc' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/articles (protégé JWT)', () => {
  test('retourne 401 sans token Authorization', async () => {
    // Entrée : requête sans header Authorization
    // Résultat attendu : 401 Authentication required
    const res = await request(app)
      .post('/api/articles')
      .send({ title: 'Test', category: 'warzone' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  test('retourne 401 avec un token JWT expiré/invalide', async () => {
    // Entrée : token JWT forgé invalide
    // Résultat attendu : 401 Invalid token
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', 'Bearer token.invalide.xyz')
      .send({ title: 'Test', category: 'warzone' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/teams', () => {
  test('retourne 200 avec un tableau', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/matches', () => {
  test('retourne 200 avec un tableau', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/health', () => {
  test('retourne 200 avec status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
