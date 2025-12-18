const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { errorHandler } = require('./middlewares/errorHandler');

const { router: authRouter } = require('./modules/auth/auth.routes');
const { publicRouter: publicArticlesRouter, adminRouter: adminArticlesRouter } = require('./modules/articles/article.routes');
const { router: uploadsRouter } = require('./modules/uploads/upload.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(pinoHttp({ logger }));

app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '..', env.UPLOAD_DIR), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/articles', publicArticlesRouter);
app.use('/api/v1/admin/articles', adminArticlesRouter);
app.use('/api/v1/admin/uploads', uploadsRouter);

app.use(errorHandler);

module.exports = { app };
