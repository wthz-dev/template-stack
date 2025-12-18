const { logger } = require('../config/logger');
const articleService = require('../modules/articles/article.service');

let intervalId = null;

async function runOnce() {
  try {
    const n = await articleService.publishDueScheduled();
    if (n > 0) {
      logger.info({ published: n }, 'Scheduled articles published');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to publish scheduled articles');
  }
}

function startSchedulers() {
  if (intervalId) return;

  runOnce();
  intervalId = setInterval(runOnce, 30 * 1000);
  logger.info('Schedulers started');
}

module.exports = { startSchedulers };
