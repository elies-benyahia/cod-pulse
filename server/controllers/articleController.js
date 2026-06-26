const articleService = require('../services/articleService');

const list = async (req, res, next) => {
  try {
    const { category, page, limit, tag } = req.query;
    const result = await articleService.getArticles({
      category,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 10, 50),
      tag
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);
    res.json(article);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(req.body);
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const article = await articleService.updateArticle(parseInt(req.params.id), req.body);
    res.json(article);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await articleService.deleteArticle(parseInt(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const stats = async (req, res, next) => {
  try {
    const data = await articleService.getArticleStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getOne, create, update, remove, stats };
