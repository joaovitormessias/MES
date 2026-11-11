# Manufacturing Execution System

**Track production steps, piece counts, quality events and shift effectiveness in one manufacturing domain model.**

A portfolio prototype exploring the boundary between production planning and shop-floor execution, with TypeScript, Express, Prisma, PostgreSQL, Redis and Socket.IO. A separate Next.js interface and industrial integration experiments live in the same repository.

[Product scope](#product-scope) · [Code walkthrough](#code-walkthrough) · [Local setup](#local-backend-setup) · [Verification](#verification) · [Limitations](#limitations)

> **Status:** development prototype, not a production-grade MES. Several API routes are placeholders. No live factory deployment, completed ERP integration or end-to-end equipment demonstration is claimed.

## Product scope

The intended workflow is: select a production order, start a process step, record counts and quality events, then inspect traceability and shift OEE. The repository models that workflow through services and relational entities; it does not implement every feature described in planning documents.

| Area | Current implementation |
| --- | --- |
| Production orders and execution | Domain services and REST routes for process operations |
| Quality | Scrap/reuse handling in the quality service |
| OEE | Availability × performance × quality, shift calculation and snapshots |
| Traceability | Lot/order query routes backed by Prisma relations |
| Events and infrastructure | Redis event bus, idempotency utilities, metrics and Socket.IO wiring |
| Industrial data | ThingsBoard adapter, telemetry routes and bridge experiments; live integration unverified |
| Dashboards, approvals, MTTR and MTBF | Several routes return explicit “to be implemented” responses |
| ERP jobs | Configuration/planning exists; no executable ERP sync job is shipped |

## Code walkthrough

| Engineering concern | Entry point | Review focus |
| --- | --- | --- |
| Consistent production state | [Execution service](backend/src/domain/execution/execution.service.ts) | State transitions and recorded quantities |
| Shift calculations | [OEE service](backend/src/domain/oee/oee.service.ts) | Overnight boundaries, clipped downtime and overlap merging |
| Relational model | [Prisma schema](backend/prisma/schema.prisma) | Orders, steps, operators, lots and telemetry |
| Request boundaries | [Route modules](backend/src/api/routes) | Implemented operations versus placeholders |
| Identity and roles | [Authentication routes](backend/src/api/routes/auth.routes.ts) | Demo registration guard and badge-based login limitations |
| Delivery and duplication | [Event bus](backend/src/events/event-bus.ts) and [idempotency utility](backend/src/utils/idempotency.ts) | Redis dependency and failure semantics |
| Verification | [OEE tests](backend/src/domain/oee/oee.service.test.ts) | Formula and shift-boundary regression cases with a mocked database |

Backend domain services share one PostgreSQL database. Redis supports event delivery and duplicate-request handling. Device adapters are integration boundaries, not proof that a physical production line has been connected.

## Local backend setup

Use Node.js 20+ and npm 10+, PostgreSQL and Redis. Commands run from the repository root unless shown otherwise.

```bash
git clone https://github.com/joaovitormessias/MES.git
cd MES
docker compose up -d mes-postgres mes-redis
cd backend
npm install
npm run prisma:generate
```

Start only those two Compose services for the backend walkthrough. The full Compose file references a separate `digital-twin/` checkout that is not included. Its default credentials are for local development only; do not expose the database/Redis ports publicly.

Create `backend/.env` with local values:

```dotenv
NODE_ENV=development
PORT=3050
DATABASE_URL=postgresql://mes_user:mes_password@localhost:5433/mes_renar
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-with-a-long-random-local-secret
CORS_ORIGIN=http://localhost:3001
```

For a **new disposable local database**, create the schema and start the API:

```bash
npx prisma db push
npm run dev
```

This is a local prototype setup, not a production migration procedure. The current repository does not provide a dependable committed migration history. Production orders/workcenters/steps must be populated before their operations can be demonstrated; empty tables do not constitute a working production flow.

Check HTTP responsiveness:

```bash
curl http://localhost:3050/health
```

In development, `POST /api/v1/auth/register` accepts `badge` and `name` to provision a demo operator. Login uses `POST /api/v1/auth/login` with that badge and returns a bearer token. Registration returns HTTP 403 in production; **badge-only login still is not production authentication**. Protect the environment accordingly.

### Frontend and optional integrations

`frontend/` is a separate Next.js application with Supabase/API configuration in [its client modules](frontend/src/lib). It is not started by the backend commands. Its generated [frontend README](frontend/README.md) covers the development server, but backend/Supabase alignment and a complete browser demo still need validation.

The [digital twin project](https://github.com/joaovitormessias/digital-twin-for-a-timber-company) is a separate repository. ThingsBoard, Grafana and AI routes need additional credentials and infrastructure; they are not prerequisites for isolated OEE tests.

## Verification

From `backend/`:

```bash
npm run prisma:generate
npm run build
npm test -- --runInBand
```

The backend has its own TypeScript output directory (`backend/dist`) and Jest configuration. `npm start` runs the compiled `dist/api/server.js` after a successful build.

The backend build and seven tests passed. The review covers the standard OEE formula, missing schedules, overnight shifts, overlapping downtime, zero-duration rejection and production demo-registration denial. Prisma is mocked in domain tests; Docker, live PostgreSQL/Redis, factory equipment, frontend acceptance and external APIs were not exercised. Build/test results do not imply production readiness.

## Limitations

- Authentication is a demo badge lookup. Some integration routes lack application authorization, and default secrets/credentials must be replaced before any shared environment.
- Shift times use the server timezone; choose it deliberately. Site-specific calendars, DST policy, partial-shift reporting and executions spanning shifts require further domain decisions.
- OEE uses execution start time to select production and defaults missing ideal cycle time to one minute. Validate this convention with production data before interpreting results.
- Dashboards, approvals, MTTR/MTBF and ERP jobs are incomplete. Removed npm job commands previously pointed to files that do not exist.
- Dependencies are not locked in this repository. Database migrations and operational recovery need a separate implementation and verification effort.

Next milestones: implement password/identity-based authentication and consistent authorization, establish migrations and seed fixtures, complete the placeholder routes, then record an end-to-end synthetic production walkthrough.

## License and maintainer

The backend package declares `UNLICENSED`; this README grants no additional license. Maintained by [João Vitor Messias da Cruz Damasio](https://github.com/joaovitormessias).
