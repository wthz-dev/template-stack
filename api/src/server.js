const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { app } = require('./app');
const { sequelize } = require('./models');
const { startSchedulers } = require('./tasks/scheduler');

async function main() {
  try {
    await sequelize.authenticate();
    logger.info('DB connected');

    if (env.DB_SYNC) {
      await sequelize.sync();
      logger.info('DB synced');
    }

    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, 'API listening');
    });

    startSchedulers();

    const shutdown = async () => {
      logger.info('Shutting down...');
      server.close(() => logger.info('HTTP server closed'));
      await sequelize.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error({ err }, 'Fatal startup error');
    process.exit(1);
  }
}

main();
