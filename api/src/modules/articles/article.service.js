const { env } = require('../../config/env');
const { redis } = require('../../config/redis');
const { BadRequestError, NotFoundError } = require('../../shared/errors');
const repo = require('./article.repository');
const {
  getArticleDetailKey,
  getArticlesListVersion,
  bumpArticlesListVersion
} = require('./article.cache');

function buildPagination({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

function toPlain(model) {
  if (!model) return model;
  if (Array.isArray(model)) return model.map(toPlain);
  return typeof model.toJSON === 'function' ? model.toJSON() : model;
}

async function safeRedisGet(key) {
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function safeRedisSet(key, value, ttlSeconds) {
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    return;
  }
}

async function safeRedisDel(keys) {
  try {
    if (Array.isArray(keys)) {
      if (keys.length === 0) return;
      await redis.del(keys);
      return;
    }

    await redis.del(keys);
  } catch {
    return;
  }
}

function buildUpsertData(input, existingArticle) {
  const base = {
    slug: input.slug,
    title: input.title,
    summary: input.summary ?? null,
    content: input.content,
    status: input.status
  };

  if (input.status === 'draft') {
    return { ...base, publishedAt: null, scheduledAt: null };
  }

  if (input.status === 'published') {
    const publishedAt = existingArticle?.publishedAt ? existingArticle.publishedAt : new Date();
    return { ...base, publishedAt, scheduledAt: null };
  }

  if (input.status === 'scheduled') {
    if (!input.scheduledAt) {
      throw new BadRequestError('scheduledAt is required when status is scheduled');
    }

    return { ...base, publishedAt: null, scheduledAt: input.scheduledAt };
  }

  throw new BadRequestError('Invalid status');
}

async function getPublicList({ page, limit }) {
  let version = 1;
  try {
    version = await getArticlesListVersion();
  } catch {
    version = 1;
  }

  const cacheKey = `articles:list:v${version}:page:${page}:limit:${limit}`;

  const cached = await safeRedisGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const now = new Date();
  const { items, total } = await repo.findPublicList({ page, limit, now });
  const payload = {
    items: toPlain(items),
    pagination: buildPagination({ page, limit, total })
  };

  await safeRedisSet(cacheKey, JSON.stringify(payload), env.CACHE_TTL_SECONDS);
  return payload;
}

async function getPublicBySlug(slug) {
  const cacheKey = getArticleDetailKey(slug);

  const cached = await safeRedisGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const now = new Date();
  const article = await repo.findPublicBySlug({ slug, now });
  if (!article) throw new NotFoundError('Article not found');

  const payload = toPlain(article);
  await safeRedisSet(cacheKey, JSON.stringify(payload), env.CACHE_TTL_SECONDS);
  return payload;
}

async function getAdminList({ page, limit, status }) {
  const { items, total } = await repo.findAdminList({ page, limit, status });
  return {
    items: toPlain(items),
    pagination: buildPagination({ page, limit, total })
  };
}

async function getAdminById(id) {
  const article = await repo.findById(id);
  if (!article) throw new NotFoundError('Article not found');
  return toPlain(article);
}

async function createArticle(input, authorId) {
  const existing = await repo.findBySlug(input.slug);
  if (existing) throw new BadRequestError('Slug already exists');

  const data = buildUpsertData(input, null);
  const article = await repo.createArticle({ ...data, authorId });

  await safeRedisDel(getArticleDetailKey(article.slug));
  try {
    await bumpArticlesListVersion();
  } catch {
    return toPlain(article);
  }

  return toPlain(article);
}

async function updateArticleById(id, input) {
  const article = await repo.findById(id);
  if (!article) throw new NotFoundError('Article not found');

  const oldSlug = article.slug;

  if (input.slug && input.slug !== oldSlug) {
    const slugOwner = await repo.findBySlug(input.slug);
    if (slugOwner && String(slugOwner.id) !== String(id)) {
      throw new BadRequestError('Slug already exists');
    }
  }

  const data = buildUpsertData(input, article);
  const updated = await repo.updateArticle(article, data);

  const keysToDelete = [getArticleDetailKey(oldSlug), getArticleDetailKey(updated.slug)];
  await safeRedisDel(keysToDelete);

  try {
    await bumpArticlesListVersion();
  } catch {
    return toPlain(updated);
  }

  return toPlain(updated);
}

async function deleteArticleById(id) {
  const article = await repo.findById(id);
  if (!article) throw new NotFoundError('Article not found');

  const slug = article.slug;
  await repo.deleteArticle(article);

  await safeRedisDel(getArticleDetailKey(slug));
  try {
    await bumpArticlesListVersion();
  } catch {
    return;
  }
}

async function publishDueScheduled() {
  const now = new Date();
  const due = await repo.findDueScheduled(now);

  if (!due || due.length === 0) {
    return 0;
  }

  for (const article of due) {
    const publishedAt = article.scheduledAt || now;
    await repo.updateArticle(article, {
      status: 'published',
      publishedAt,
      scheduledAt: null
    });

    await safeRedisDel(getArticleDetailKey(article.slug));
  }

  try {
    await bumpArticlesListVersion();
  } catch {
    return due.length;
  }

  return due.length;
}

module.exports = {
  getPublicList,
  getPublicBySlug,
  getAdminList,
  getAdminById,
  createArticle,
  updateArticleById,
  deleteArticleById,
  publishDueScheduled
};
