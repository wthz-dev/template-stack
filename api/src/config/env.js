const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  UPLOAD_DIR: z.string().default('uploads'),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),

  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default('app'),
  DB_USER: z.string().default('app'),
  DB_PASSWORD: z.string().default('app'),
  DB_LOG_SQL: z
    .union([z.literal('true'), z.literal('false')])
    .default('false')
    .transform((v) => v === 'true'),
  DB_SYNC: z
    .union([z.literal('true'), z.literal('false')])
    .default('true')
    .transform((v) => v === 'true'),

  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PREFIX: z.string().default('template_rest:'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),

  JWT_SECRET: z.string().min(1).default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('1h'),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  SEED_ADMIN_PASSWORD: z.string().min(6).default('admin1234'),
  SEED_EDITOR_EMAIL: z.string().email().default('editor@example.com'),
  SEED_EDITOR_PASSWORD: z.string().min(6).default('editor1234')
});

const env = envSchema.parse(process.env);

module.exports = { env };
