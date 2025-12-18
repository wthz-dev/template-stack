const { Op } = require('sequelize');
const { Article, User } = require('../../models');

async function findPublicList({ page, limit, now }) {
  const offset = (page - 1) * limit;

  const where = {
    [Op.or]: [
      { status: 'published' },
      {
        status: 'scheduled',
        scheduledAt: { [Op.lte]: now }
      }
    ]
  };

  const { rows, count } = await Article.findAndCountAll({
    where,
    order: [['publishedAt', 'DESC'], ['id', 'DESC']],
    offset,
    limit,
    attributes: ['id', 'slug', 'title', 'summary', 'publishedAt'],
    include: [{ model: User, as: 'author', attributes: ['id', 'email', 'role'] }]
  });

  return { items: rows, total: count };
}

async function findPublicBySlug({ slug, now }) {
  const where = {
    slug,
    [Op.or]: [
      { status: 'published' },
      { status: 'scheduled', scheduledAt: { [Op.lte]: now } }
    ]
  };

  return Article.findOne({
    where,
    include: [{ model: User, as: 'author', attributes: ['id', 'email', 'role'] }]
  });
}

async function findAdminList({ page, limit, status }) {
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const { rows, count } = await Article.findAndCountAll({
    where,
    order: [['updatedAt', 'DESC'], ['id', 'DESC']],
    offset,
    limit,
    include: [{ model: User, as: 'author', attributes: ['id', 'email', 'role'] }]
  });

  return { items: rows, total: count };
}

async function findById(id) {
  return Article.findByPk(id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'email', 'role'] }]
  });
}

async function findBySlug(slug) {
  return Article.findOne({ where: { slug } });
}

async function createArticle(data) {
  return Article.create(data);
}

async function updateArticle(article, data) {
  return article.update(data);
}

async function deleteArticle(article) {
  return article.destroy();
}

async function findDueScheduled(now) {
  return Article.findAll({
    where: {
      status: 'scheduled',
      scheduledAt: { [Op.lte]: now }
    }
  });
}

module.exports = {
  findPublicList,
  findPublicBySlug,
  findAdminList,
  findById,
  findBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  findDueScheduled
};
