# FitFlow Pro — Coach–Client Fitness SaaS

Production-ready SaaS platform for coaches and clients. Coaches manage client targets and compliance, clients log meals, water, weight, photos, and workouts. Everything syncs into coach dashboards.

## Stack
- Next.js (App Router) + React + Tailwind
- API Routes (Node.js)
- PostgreSQL + Prisma ORM
- JWT auth (role-based)
- React Query

## Folder structure (core)
```
src/
	app/
		api/
			auth/
			clients/
			meal-logs/
			water-logs/
			weight-logs/
			photo-logs/
			workout-logs/
			messages/
			check-ins/
		coach/dashboard/
		client/dashboard/
		login/
		register/
	components/ui/
	lib/
prisma/
```

## Environment
Create a `.env` file:
```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/fitness_saas
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=7d
APP_BASE_URL=http://localhost:3000
```

## Database
```
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Run
```
npm run dev
```

## API overview
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- GET/POST /api/clients
- GET/PATCH/DELETE /api/clients/:id
- GET/POST /api/meal-logs
- PATCH /api/meal-logs/:id
- GET/POST /api/water-logs
- GET/POST /api/weight-logs
- GET/POST /api/photo-logs
- PATCH /api/photo-logs/:id
- GET/POST /api/workout-logs
- GET/POST /api/messages
- GET/POST /api/check-ins

## Security & scale notes
- JWTs stored in httpOnly cookies; role checks enforced in API and middleware.
- Use Postgres read replicas for analytics-heavy views.
- Add background jobs for weekly reports and notification delivery.
- Store photos in object storage with signed URLs.
- Add rate limiting and audit logging for compliance.

## Sample data
`prisma/seed.ts` creates a coach and a client profile for initial testing.
