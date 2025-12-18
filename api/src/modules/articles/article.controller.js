const articleService = require('./article.service');

async function publicList(req, res, next) {
  try {
    const result = await articleService.getPublicList(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function publicBySlug(req, res, next) {
  try {
    const result = await articleService.getPublicBySlug(req.params.slug);
    return res.json({ item: result });
  } catch (err) {
    return next(err);
  }
}

async function adminList(req, res, next) {
  try {
    const result = await articleService.getAdminList(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function adminById(req, res, next) {
  try {
    const result = await articleService.getAdminById(req.params.id);
    return res.json({ item: result });
  } catch (err) {
    return next(err);
  }
}

async function adminCreate(req, res, next) {
  try {
    const result = await articleService.createArticle(req.body, req.user.id);
    return res.status(201).json({ item: result });
  } catch (err) {
    return next(err);
  }
}

async function adminUpdate(req, res, next) {
  try {
    const result = await articleService.updateArticleById(req.params.id, req.body);
    return res.json({ item: result });
  } catch (err) {
    return next(err);
  }
}

async function adminDelete(req, res, next) {
  try {
    await articleService.deleteArticleById(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  publicList,
  publicBySlug,
  adminList,
  adminById,
  adminCreate,
  adminUpdate,
  adminDelete
};
