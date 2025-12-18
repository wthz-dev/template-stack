const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { logger } = require('../config/logger');
const { sequelize } = require('../models');
const userRepo = require('../modules/users/user.repository');
const articleRepo = require('../modules/articles/article.repository');

async function ensureUser({ email, password, role }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 10);
  return userRepo.createUser({ email, passwordHash, role });
}

async function main() {
  try {
    await sequelize.authenticate();
    if (env.DB_SYNC) await sequelize.sync();

    const admin = await ensureUser({
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      role: 'admin'
    });

    const editor = await ensureUser({
      email: env.SEED_EDITOR_EMAIL,
      password: env.SEED_EDITOR_PASSWORD,
      role: 'editor'
    });

    const existing = await articleRepo.findBySlug('hello-world');
    if (!existing) {
      await articleRepo.createArticle({
        slug: 'hello-world',
        title: 'Hello World',
        summary: 'First article from seed',
        content: '# Hello World\n\nThis is a seeded article in markdown.',
        status: 'published',
        publishedAt: new Date(),
        scheduledAt: null,
        authorId: admin.id
      });
    }

    logger.info({ admin: admin.email, editor: editor.email }, 'Seed complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Seed failed');
    process.exit(1);
  }
}

main();
