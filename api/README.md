# API

## Env
Copy `.env.example` to `.env`.

## Run
- `npm install`
- Start DB/Redis: `docker compose -f ../infra/docker-compose.yml up -d`
- `npm run dev`

## Seed
- `npm run db:seed`

## Endpoints
- `GET /health`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/articles`
- `GET /api/v1/articles/:slug`
- `GET /api/v1/admin/articles`
- `POST /api/v1/admin/articles`
- `PUT /api/v1/admin/articles/:id`
- `DELETE /api/v1/admin/articles/:id`
