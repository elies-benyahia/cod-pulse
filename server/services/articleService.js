const prisma = require('./prismaClient');

const getArticles = async ({ category, page = 1, limit = 10, tag } = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (category) where.category = category;
  if (tag) {
    where.tags = { path: '$', string_contains: tag };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        imageUrl: true,
        sourceName: true,
        sourceUrl: true,
        category: true,
        tags: true,
        publishedAt: true,
        createdAt: true
      }
    }),
    prisma.article.count({ where })
  ]);

  return {
    data: articles,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getArticleBySlug = async (slug) => {
  const article = await prisma.article.findUnique({
    where: { slug }
  });
  if (!article) {
    const err = new Error('Article not found');
    err.status = 404;
    throw err;
  }
  return article;
};

const createArticle = async (data) => {
  const slug = data.slug || slugify(data.title);

  const exists = await prisma.article.findUnique({ where: { slug } });
  if (exists) {
    const err = new Error('Article with this slug already exists');
    err.status = 409;
    throw err;
  }

  return prisma.article.create({
    data: {
      ...data,
      slug,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date()
    }
  });
};

const updateArticle = async (id, data) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    const err = new Error('Article not found');
    err.status = 404;
    throw err;
  }
  return prisma.article.update({ where: { id }, data });
};

const deleteArticle = async (id) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    const err = new Error('Article not found');
    err.status = 404;
    throw err;
  }
  return prisma.article.delete({ where: { id } });
};

const getArticleStats = async () => {
  const [total, warzone, cdl] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { category: 'warzone' } }),
    prisma.article.count({ where: { category: 'cdl' } })
  ]);
  return { total, warzone, cdl };
};

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200)
    + '-' + Date.now();
}

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleStats,
  slugify
};
