const { z } = require('zod');

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

const publicArticleSlugParamsSchema = z.object({
  slug: z.string().min(1)
});

const adminListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published', 'scheduled']).optional()
});

const adminIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const upsertArticleBodySchema = z
  .object({
    slug: z.string().min(1).max(255),
    title: z.string().min(1).max(255),
    summary: z.string().max(5000).optional().nullable(),
    content: z.string().min(1),
    status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
    scheduledAt: z.coerce.date().optional().nullable()
  })
  .superRefine((val, ctx) => {
    if (val.status === 'scheduled' && !val.scheduledAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'scheduledAt is required when status is scheduled'
      });
    }

    if (val.status !== 'scheduled' && val.scheduledAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'scheduledAt must be empty unless status is scheduled'
      });
    }
  });

module.exports = {
  paginationQuerySchema,
  publicArticleSlugParamsSchema,
  adminListQuerySchema,
  adminIdParamsSchema,
  upsertArticleBodySchema
};
