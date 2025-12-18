const { redis } = require('../../config/redis');

const LIST_VERSION_KEY = 'articles:list:version';

function getArticleDetailKey(slug) {
  return `article:slug:${slug}`;
}

async function getArticlesListVersion() {
  const raw = await redis.get(LIST_VERSION_KEY);
  if (!raw) return 1;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

async function bumpArticlesListVersion() {
  await redis.incr(LIST_VERSION_KEY);
}

module.exports = {
  getArticleDetailKey,
  getArticlesListVersion,
  bumpArticlesListVersion
};
