# MES RENAR Backend

Manufacturing Execution System (MES) backend for RENAR - A production-grade system for real-time manufacturing execution, quality management, OEE tracking, and complete traceability.

## 🎯 Features

- **Production Order Management**: Import from ERP, track execution, automatic replenishment
- **Real-time Execution**: Barcode scanning, process step tracking, piece counting
- **Quality Management**: Scrap vs reuse classification with reason codes
- **OEE Calculation**: Availability × Performance × Quality with shift-based tracking
- **Complete Traceability**: Lot genealogy and execution timeline
- **Real-time Events**: WebSocket-based updates for dashboards
- **ISA-95 Inspired**: Layered architecture separating ERP (Level 4) from execution (Level 3)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  REST API + WebSocket + Authentication + Validation          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Domain Services                         │
│  Production Orders │ Execution │ Quality │ OEE │ Traceability│
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│        ERP Adapter │ Equipment Adapters │ Event Bus          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Data & Infrastructure                      │
│         PostgreSQL │ Redis │ Prisma ORM │ Metrics            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
cd /home/user/Work/MER
npm install
```

2. **Set up environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start infrastructure** (PostgreSQL + Redis):
```bash
docker-compose up -d
```

4. **Run database migrations**:
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. **Start development server**:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Health Check

```bash
curl http://localhost:3000/health
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Production Orders
- `GET /ops` - Search/filter production orders
- `GET /ops/:id` - Get order details
- `POST /ops/:id/steps/:stepId/start` - Start process step
- `POST /ops/:id/steps/:stepId/count` - Record piece count
- `POST /ops/:id/steps/:stepId/quality` - Record quality event
- `POST /ops/:id/steps/:stepId/complete` - Complete step

#### Barcode Scanning
- `POST /scans` - Ingest barcode scan (idempotent)

#### Traceability
- `GET /traceability/lots/:lotId` - Lot timeline and genealogy
- `GET /traceability/ops/:opId` - Production order execution timeline

#### KPIs
- `GET /kpis/oee` - OEE drill-down (real-time or historical)
- `GET /kpis/mttr` - Mean Time To Repair
- `GET /kpis/mtbf` - Mean Time Between Failures

#### Dashboards
- `GET /dashboards/shift` - Shift plan vs actual
- `GET /dashboards/microstops` - Micro-stop analysis
- `GET /dashboards/quality` - Quality breakdown
- `GET /dashboards/table-utilization` - Table utilization metrics

## 🔧 Development

### Project Structure

```
src/
├── api/                    # API layer
│   ├── middleware/         # Auth, validation, error handling
│   ├── routes/             # REST endpoints
│   └── server.ts           # Express server
├── domain/                 # Business logic
│   ├── production-order/   # OP management
│   ├── execution/          # Step execution
│   ├── quality/            # Quality management
│   ├── oee/                # OEE calculation
│   └── ...
├── integrations/           # External systems
│   ├── erp/                # ERP adapters
│   └── equipment/          # Equipment adapters
├── events/                 # Event bus
├── utils/                  # Utilities
│   ├── logger.ts           # Winston logger
│   ├── metrics.ts          # Prometheus metrics
│   ├── idempotency.ts      # Redis-backed idempotency
│   └── prisma.ts           # Prisma client
└── config/                 # Configuration
```

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

### Database Management

```bash
# Create new migration
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Generate Prisma client
npm run prisma:generate
```

### Background Jobs

```bash
# Manual ERP sync
npm run job:erp-sync

# Manual OEE calculation
npm run job:oee-calc
```

## 📊 Monitoring

### Metrics Endpoint
Prometheus metrics available at:
```
http://localhost:9090/metrics
```

### Key Metrics
- `http_request_duration_seconds` - Request latency
- `execution_events_total` - Event counts by type
- `piece_count_total` - Pieces counted by workcenter
- `oee_current` - Current OEE value
- `quality_events_total` - Quality events by disposition

### Logs
Structured JSON logs in `./logs/`:
- `combined.log` - All logs
- `error.log` - Errors only

## 🔐 Security

- JWT-based authentication
- Role-based authorization (OPERATOR, SUPERVISOR, PCP, MANAGER)
- Rate limiting (100 req/min per IP)
- Helmet.js security headers
- CORS configuration
- Input validation with Zod

## 🏭 Production Deployment

### Environment Variables
See `.env.example` for all required variables.

### Docker Build
```bash
docker build -t mes-renar-backend .
```

### Database Migrations
Always run migrations before deploying:
```bash
npm run prisma:migrate
```

### Health Checks
Configure your load balancer to use:
```
GET /health
```

## 📖 Domain Events

The system publishes the following domain events (via Redis pub/sub):

- `OP_IMPORTED_FROM_ERP` - Production order imported
- `BARCODE_SCANNED` - Barcode scan processed
- `STEP_STARTED` - Process step started
- `PIECE_COUNTED` - Pieces counted
- `QUALITY_RECORDED` - Quality event recorded
- `REPLENISHMENT_OP_CREATED` - Replenishment order created
- `STEP_COMPLETED` - Process step completed

## 🔗 Integrations

### ERP Integration
Configure in `.env`:
```env
ERP_TYPE=rest  # or 'database'
ERP_API_URL=http://erp.renar.local/api
ERP_API_KEY=your-api-key
```

### Equipment Integration
- **Optimizer**: Database polling (SQL Server/MySQL/PostgreSQL)
- **CNC**: OPC UA, Modbus, or database
- **Conveyors**: PLC signals via OPC UA or REST
- **Presses/Calibrator/Brush**: Sensor data via MQTT or REST

See `docs/integrations.md` for detailed setup.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Run linter: `npm run lint`
5. Format code: `npm run format`

## 📄 License

UNLICENSED - Proprietary software for RENAR

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with**: Node.js, TypeScript, Express, PostgreSQL, Redis, Prisma, Socket.io
