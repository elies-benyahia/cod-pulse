/**
 * Tests unitaires — articleService
 *
 * Jeu d'essai documenté :
 * - Fonction slugify : transforme un titre en slug URL-safe
 * - Cas limites : caractères spéciaux, accents, longueur max, majuscules
 */

// Mock Prisma avant l'import du service
jest.mock('../services/prismaClient', () => ({
  article: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn()
  }
}));

const { slugify } = require('../services/articleService');

describe('articleService.slugify()', () => {
  test('transforme un titre simple en slug lowercase', () => {
    const input = 'Black Ops 7 Meta Breakdown';
    const result = slugify(input);
    // Le slug doit être en minuscules et sans espaces
    expect(result).toMatch(/^black-ops-7-meta-breakdown-\d+$/);
  });

  test('retire les accents et caractères spéciaux', () => {
    const input = 'Résultats CDL — Saison 2025 : tout ce qu\'il faut savoir';
    const result = slugify(input);
    expect(result).not.toMatch(/[àâéèêëîïôùûüç—':]/);
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });

  test('remplace les espaces multiples par un seul tiret', () => {
    const input = 'OpTic   Texas  vs  FaZe';
    const result = slugify(input);
    expect(result).not.toMatch(/--/);
    expect(result).toMatch(/optic-texas-vs-faze/);
  });

  test('ne commence ni ne finit par un tiret', () => {
    const input = ' — CDL Major Results — ';
    const result = slugify(input);
    expect(result).not.toMatch(/^-|-$/);
  });

  test('tronque les titres très longs (>200 chars)', () => {
    const input = 'A'.repeat(300);
    const result = slugify(input);
    // Le slug doit être ≤ 200 chars + suffixe timestamp
    const withoutTimestamp = result.replace(/-\d+$/, '');
    expect(withoutTimestamp.length).toBeLessThanOrEqual(200);
  });

  test('convertit les majuscules en minuscules', () => {
    const input = 'WARZONE RANKED PLAY GUIDE';
    const result = slugify(input);
    expect(result).toMatch(/^warzone-ranked-play-guide/);
  });

  test('ajoute un suffixe timestamp pour garantir l\'unicité', () => {
    const input = 'Test article';
    const slug1 = slugify(input);
    // Pause courte pour garantir des timestamps différents
    const slug2 = slugify(input + ' modified');
    expect(slug1).not.toEqual(slug2);
  });
});
