const express = require('express');
const { validate } = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const { requireRole } = require('../../middlewares/requireRole');
const controller = require('./article.controller');
const {
  paginationQuerySchema,
  publicArticleSlugParamsSchema,
  adminListQuerySchema,
  adminIdParamsSchema,
  upsertArticleBodySchema
} = require('./article.schema');

const publicRouter = express.Router();
publicRouter.get('/', validate({ query: paginationQuerySchema }), controller.publicList);
publicRouter.get(
  '/:slug',
  validate({ params: publicArticleSlugParamsSchema }),
  controller.publicBySlug
);

const adminRouter = express.Router();
adminRouter.use(authenticate);
adminRouter.use(requireRole(['admin', 'editor']));

adminRouter.get('/', validate({ query: adminListQuerySchema }), controller.adminList);
adminRouter.get('/:id', validate({ params: adminIdParamsSchema }), controller.adminById);
adminRouter.post('/', validate({ body: upsertArticleBodySchema }), controller.adminCreate);
adminRouter.put(
  '/:id',
  validate({ params: adminIdParamsSchema, body: upsertArticleBodySchema }),
  controller.adminUpdate
);
adminRouter.delete('/:id', validate({ params: adminIdParamsSchema }), controller.adminDelete);

module.exports = {
  publicRouter,
  adminRouter
};
