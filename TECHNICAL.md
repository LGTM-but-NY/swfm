# SWFM Technical Documentation

## Table of Contents

- [1. Introduction](#1-introduction)
- [2. System Architecture](#2-system-architecture)
- [3. Database Design](#3-database-design)
- [4. RBAC Implementation](#4-rbac-implementation)
- [5. Data Flow](#5-data-flow)
- [6. Technology Stack](#6-technology-stack)
- [7. Security & Authorization](#7-security--authorization)
- [8. Operational Workflows](#8-operational-workflows)

---

## 1. Introduction

SWFM (Smart Water Forecasting Management) is a production-ready water level forecasting system for the Mekong River monitoring stations. The system employs a microservices architecture combining a Next.js frontend, FastAPI ML service, MLflow experiment tracking, and Supabase/PostgreSQL backend with comprehensive role-based access control.

### Key Features

- **Multi-horizon Forecasting**: Predictions for 15, 30, 45, and 60-minute intervals
- **Automated ML Pipeline**: Scheduled training and prediction generation
- **Real-time Data Integration**: Hourly weather updates and 15-minute station measurements
- **Role-Based Access Control**: Three-tier permission system with database-level enforcement
- **Experiment Tracking**: Complete MLflow integration for model versioning and metrics
- **Monorepo Architecture**: Turborepo-managed workspace with pnpm

---

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js Web App<br/>Port 3000]
    end
    
    subgraph "Service Layer"
        API[ML API Service<br/>FastAPI - Port 8000]
        MLF[MLflow Server<br/>Port 5000]
        TRAINER[ML Auto-Trainer<br/>Background Service]
    end
    
    subgraph "Data Layer"
        SUPABASE[(Supabase PostgreSQL<br/>Application Database)]
        MLDB[(MLflow PostgreSQL<br/>Experiment Tracking)]
    end
    
    subgraph "Storage Layer"
        ARTIFACTS[MLflow Artifacts<br/>Model Files]
        MODELS[ML Models<br/>Trained Models]
    end
    
    subgraph "External Services"
        MK[MK Monitoring API<br/>Station Data]
        OW[OpenWeather API<br/>Weather Data]
    end
    
    WEB -->|REST API| API
    WEB -->|Auth & Data| SUPABASE
    API -->|Track Experiments| MLF
    API -->|Query Data| SUPABASE
    TRAINER -->|Auto-Training| API
    MLF -->|Metadata| MLDB
    MLF -->|Artifacts| ARTIFACTS
    API -->|Save/Load Models| MODELS
    
    SUPABASE -.->|pg_cron: 15min| MK
    SUPABASE -.->|pg_cron: 1hr| OW
    
    style WEB fill:#4CAF50
    style API fill:#2196F3
    style MLF fill:#FF9800
    style SUPABASE fill:#9C27B0
    style MLDB fill:#9C27B0
```

### 2.2 Service Communication

```mermaid
sequenceDiagram
    participant User
    participant Web as Next.js
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant API as ML API
    participant MLflow
    
    User->>Web: Access Application
    Web->>Auth: Authenticate
    Auth->>DB: Validate Session
    DB-->>Auth: User + Role
    Auth-->>Web: Session Token
    
    User->>Web: Request Forecast
    Web->>API: POST /predict/generate
    API->>DB: Fetch Station Data
    DB-->>API: Measurements + Weather
    API->>MLflow: Load Active Model
    MLflow-->>API: Model Artifact
    API->>API: Generate Prediction
    API->>DB: Save Forecast
    API-->>Web: Prediction Results
    Web-->>User: Display Forecast
```

### 2.3 Docker Service Architecture

The application runs as containerized services orchestrated by Docker Compose:

| Service | Technology | Port | Purpose | Dependencies |
|---------|-----------|------|---------|--------------|
| **nextjs** | Next.js 16 | 3000 | Frontend web application | ml-api |
| **ml-api** | FastAPI | 8000 | ML REST API service | mlflow |
| **ml-trainer** | Python | - | Background auto-trainer | ml-api |
| **mlflow** | MLflow 2.9 | 5000 | Experiment tracking server | mlflow-postgres |
| **mlflow-postgres** | PostgreSQL 14 | 5432 | MLflow backend storage | - |

**Shared Network**: All services communicate via `swfm-network` (bridge driver)

**Persistent Volumes**:
- `mlflow-pgdata`: MLflow database persistence
- `mlflow-artifacts`: Model artifacts and experiment files
- `ml-models`: Trained model storage
- `ml-logs`: Training and prediction logs

---

## 3. Database Design

### 3.1 Schema Overview

```mermaid
erDiagram
    auth_users ||--o{ users : "has profile"
    users ||--o{ user_roles : "has roles"
    role_permissions ||--o{ user_roles : "defines"
    
    stations ||--o{ station_measurements : "records"
    stations ||--o{ weather_measurements : "records"
    stations ||--o{ forecasts : "predicts"
    stations ||--o{ model_performance : "evaluates"
    stations ||--o{ station_model_configs : "configures"
    
    active_models ||--o{ forecasts : "generates"
    preprocessing_configs ||--o{ model_performance : "uses"
    
    users {
        uuid id PK
        text email
        text full_name
        enum status
        timestamptz created_at
    }
    
    user_roles {
        bigserial id PK
        uuid user_id FK
        enum role
    }
    
    role_permissions {
        bigserial id PK
        enum role
        enum permission
    }
    
    stations {
        bigserial id PK
        text station_code UK
        text name
        float latitude
        float longitude
        text region
        bool is_deleted
    }
    
    station_measurements {
        bigserial id PK
        bigint station_id FK
        timestamptz measured_at
        numeric water_level
        numeric rainfall
        text status
    }
    
    weather_measurements {
        bigserial id PK
        bigint station_id FK
        timestamptz measured_at
        numeric temperature
        numeric humidity
        numeric pressure
        numeric wind_speed
    }
    
    forecasts {
        bigserial id PK
        bigint station_id FK
        timestamptz forecast_date
        timestamptz target_date
        numeric water_level
    }
    
    model_performance {
        uuid id PK
        bigint station_id FK
        text model_type
        float rmse
        float mae
        float r2
        timestamptz evaluated_at
    }
    
    active_models {
        uuid id PK
        int horizon_minutes UK
        text model_name
        text model_version
        text model_run_id
        timestamptz activated_at
    }
```

### 3.2 Core Tables

#### Authentication & Users
- **auth.users**: Managed by Supabase Auth (email/password)
- **public.users**: User profiles with approval status (pending/active/rejected)
- **public.user_roles**: User-to-role assignments (many-to-many)
- **public.role_permissions**: Role-to-permission mappings

#### Station Data
- **stations**: Monitoring station metadata (location, thresholds)
- **station_measurements**: Water level and rainfall data (15-minute sync)
- **weather_measurements**: OpenWeather API data (hourly sync)
- **forecasts**: Generated predictions with target timestamps

#### ML Model Management
- **model_performance**: Stored evaluation metrics (RMSE, MAE, R²)
- **station_model_configs**: Per-station model configurations
- **active_models**: Currently deployed models by horizon
- **preprocessing_configs**: Feature engineering settings

### 3.3 Key Design Patterns

**Soft Deletes**: Stations use `is_deleted` flag instead of hard deletion

**Upserts**: Measurements use `ON CONFLICT DO UPDATE` for idempotency

**Composite Keys**: Measurements use `(station_id, measured_at)` uniqueness

**Audit Trails**: `created_at` and `updated_at` timestamps on configuration tables

**Enum Types**: Custom PostgreSQL enums for roles, permissions, and status values

---

## 4. RBAC Implementation

### 4.1 Role Hierarchy

```mermaid
graph TD
    subgraph "Role System"
        ADMIN[Admin Role]
        EXPERT[Data Scientist Role<br/>UI: Expert]
        GUEST[Guest<br/>No DB Role]
    end
    
    subgraph "Permissions"
        P1[users.manage]
        P2[data.manage]
        P3[models.tune]
        P4[data.download]
    end
    
    subgraph "Access Levels"
        A1[User Management]
        A2[Data Management]
        A3[Model Training]
        A4[Data Export]
        A5[Dashboard View]
    end
    
    ADMIN --> P1
    ADMIN --> P2
    ADMIN --> P3
    ADMIN --> P4
    
    EXPERT --> P3
    EXPERT --> P4
    
    P1 --> A1
    P2 --> A2
    P3 --> A3
    P4 --> A4
    
    GUEST --> A5
    EXPERT --> A5
    ADMIN --> A5
    
    style ADMIN fill:#f44336
    style EXPERT fill:#2196F3
    style GUEST fill:#9E9E9E
```

### 4.2 Permission Matrix

| Permission | Admin | Expert (Data Scientist) | Guest |
|-----------|-------|-------------------------|-------|
| **users.manage** | ✅ | ❌ | ❌ |
| **data.manage** | ✅ | ❌ | ❌ |
| **models.tune** | ✅ | ✅ | ❌ |
| **data.download** | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |
| View Forecasts | ✅ | ✅ | ✅ |
| View Stations | ✅ | ✅ | ✅ |

### 4.3 Authorization Layers

**Layer 1: Database RLS (Row Level Security)**
- All tables have RLS policies enabled
- `authorize(permission, user_id)` function validates permissions via role_permissions join
- Policies enforce read/write access at the database level

**Layer 2: API Authorization**
- FastAPI endpoints use Supabase service role key
- No additional API-level auth (relies on client auth)
- ML operations assume authenticated requests from web app

**Layer 3: Frontend Guards**
- `AuthProvider` fetches user role and status on mount
- Role mapping: `admin` (DB) → `admin` (UI), `data_scientist` (DB) → `expert` (UI)
- Sidebar navigation filtered by role
- Protected pages redirect non-authorized users
- Components conditionally rendered based on permissions

### 4.4 First User Bootstrap

The system implements automatic admin assignment for the first user:

1. **Trigger**: `on_auth_user_created` fires after Supabase auth registration
2. **Function**: `handle_new_user()` checks total user count
3. **First User**: Receives `admin` role + `active` status automatically
4. **Subsequent Users**: Assigned `data_scientist` role + `pending` status
5. **Admin Approval**: Admin changes status from `pending` to `active` or `rejected`

---

## 5. Data Flow

### 5.1 User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Web as Next.js Auth Page
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant Provider as AuthProvider
    
    User->>Web: Sign Up / Login
    Web->>Auth: createUser() / signIn()
    Auth->>Auth: Create auth.users record
    Auth->>DB: Trigger: on_auth_user_created
    
    alt First User
        DB->>DB: Count users = 0
        DB->>DB: INSERT users (status: active)
        DB->>DB: INSERT user_roles (role: admin)
    else Subsequent Users
        DB->>DB: INSERT users (status: pending)
        DB->>DB: INSERT user_roles (role: data_scientist)
    end
    
    Auth-->>Web: Session Token
    Web->>Provider: Initialize Auth Context
    Provider->>DB: Fetch user_roles
    Provider->>DB: Fetch users.status
    Provider->>Provider: Map DB role → UI role
    Provider-->>Web: {role, status, user}
    
    alt Status = pending
        Web->>User: Show "Pending Approval" Message
    else Status = rejected
        Web->>User: Show "Access Denied" Message
    else Status = active
        Web->>User: Render Dashboard
    end
```

### 5.2 ML Training Workflow

```mermaid
flowchart TB
    Start([User Initiates Training<br/>or Auto-Scheduler])
    
    Start --> FetchConfig[Load Training Config<br/>- Stations<br/>- Date Range<br/>- Model Types]
    
    FetchConfig --> FetchData[Fetch Data from DB<br/>- station_measurements<br/>- weather_measurements]
    
    FetchData --> Merge[Merge Station + Weather Data<br/>Time-aligned join]
    
    Merge --> Features[Feature Engineering<br/>- Lag features 1h-24h<br/>- Rolling statistics<br/>- Rate of change<br/>- Time features<br/>- Weather interactions]
    
    Features --> Split[Train-Test Split<br/>80/20 or Time-based]
    
    Split --> TrainLoop{For each<br/>Horizon x Model}
    
    TrainLoop --> Scale[StandardScaler<br/>Fit & Transform]
    
    Scale --> Fit[Model.fit<br/>Linear / Ridge]
    
    Fit --> Eval[Evaluate on Test<br/>MAE, RMSE, R², MAPE]
    
    Eval --> MLflow[MLflow Tracking<br/>- Log params<br/>- Log metrics<br/>- Log model artifact]
    
    MLflow --> SavePerf[Save to DB<br/>model_performance table]
    
    SavePerf --> Register[MLflow Model Registry<br/>swfm-TYPE-STATION-HORIZON]
    
    Register --> TrainLoop
    
    TrainLoop --> End([Return Training Results])
    
    style Start fill:#4CAF50
    style End fill:#4CAF50
    style MLflow fill:#FF9800
    style Register fill:#FF9800
```

### 5.3 Prediction Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant Web as Next.js
    participant API as ML API
    participant DB as PostgreSQL
    participant MLflow
    
    User->>Web: Request Forecast
    Web->>API: POST /predict/generate-forecasts
    
    API->>DB: Fetch latest 48h data
    DB-->>API: Measurements + Weather
    
    API->>API: Feature Engineering<br/>(same as training)
    
    loop For each horizon (15, 30, 45, 60 min)
        API->>DB: Query active_models<br/>WHERE horizon_minutes = ?
        DB-->>API: {model_name, version, run_id}
        
        API->>MLflow: Load model by run_id
        MLflow-->>API: Model + Scaler
        
        API->>API: model.predict(features)
        
        API->>DB: INSERT INTO forecasts<br/>(station, forecast_date, target_date, water_level)
    end
    
    API-->>Web: Forecasts generated
    Web-->>User: Display predictions
```

### 5.4 Data Synchronization Flow

```mermaid
flowchart LR
    subgraph "Scheduled Jobs (pg_cron)"
        CRON1[Every 15 minutes<br/>Station Sync]
        CRON2[Every 1 hour<br/>Weather Sync]
    end
    
    subgraph "Supabase Edge Functions"
        SYNC1[sync-measurements]
        SYNC2[sync-weather]
    end
    
    subgraph "External APIs"
        MK[MK Monitoring API]
        OW[OpenWeather API]
    end
    
    subgraph "Database"
        DB1[(station_measurements)]
        DB2[(weather_measurements)]
        LOG[(sync_logs)]
    end
    
    CRON1 -->|Invoke| SYNC1
    CRON2 -->|Invoke| SYNC2
    
    SYNC1 -->|GET /monitoring-station| MK
    SYNC2 -->|GET /weather| OW
    
    MK -->|Water level + Rainfall| SYNC1
    OW -->|Temperature + Weather| SYNC2
    
    SYNC1 -->|UPSERT| DB1
    SYNC2 -->|UPSERT| DB2
    
    SYNC1 -->|Log results| LOG
    SYNC2 -->|Log results| LOG
    
    style CRON1 fill:#9C27B0
    style CRON2 fill:#9C27B0
    style SYNC1 fill:#2196F3
    style SYNC2 fill:#2196F3
```

### 5.5 Model Activation Flow

```mermaid
sequenceDiagram
    participant Admin as Admin/Expert User
    participant Web as Next.js
    participant DB as PostgreSQL
    participant API as ML API
    
    Admin->>Web: Navigate to Models Page
    Web->>DB: Fetch model_performance<br/>ORDER BY evaluated_at DESC
    DB-->>Web: List of trained models + metrics
    
    Admin->>Admin: Review model metrics<br/>(RMSE, MAE, R²)
    Admin->>Web: Select model for activation<br/>(horizon + model_run_id)
    
    Web->>DB: UPDATE active_models<br/>SET model_name, version, run_id<br/>WHERE horizon_minutes = ?
    
    DB->>DB: Validate via RLS<br/>authorize('models.tune', user_id)
    
    alt Permission Granted
        DB-->>Web: Model activated
        Web-->>Admin: Success notification
        
        Note over API,DB: Next prediction request<br/>will use new model
    else Permission Denied
        DB-->>Web: Error: Unauthorized
        Web-->>Admin: Error notification
    end
```

---

## 6. Technology Stack

### 6.1 Frontend Architecture

**Framework**: Next.js 16 (App Router + React Server Components)

**Key Technologies**:
- **React 19**: UI library with latest concurrent features
- **TypeScript 5.9**: Type safety across the application
- **Tailwind CSS 4**: Utility-first styling with v4 engine
- **shadcn/ui**: Radix UI-based component library
- **Supabase Client**: Real-time subscriptions and database access
- **Recharts 3**: Data visualization for time-series charts
- **React Leaflet**: Interactive maps for station locations
- **TanStack Table 8**: Advanced data table with sorting/filtering
- **React Hook Form + Zod**: Type-safe form validation

**Architectural Patterns**:
- Server Components for data fetching (default)
- Client Components for interactivity (`'use client'`)
- Server Actions for mutations (`'use server'`)
- Route Groups for layout organization (`(protected-pages)`)
- Parallel Routes for modals (optional)

### 6.2 Backend Architecture

**Framework**: FastAPI (async ASGI)

**Key Technologies**:
- **Uvicorn**: ASGI server with auto-reload in dev
- **Pydantic 2**: Data validation and serialization
- **MLflow 2.9**: Experiment tracking and model registry
- **Scikit-learn**: ML models (Linear, Ridge, StandardScaler)
- **Pandas**: Data manipulation and feature engineering
- **NumPy**: Numerical operations
- **Supabase Client**: Database access from Python
- **Schedule**: Cron-like job scheduling for auto-trainer

**API Design Patterns**:
- RESTful endpoints with OpenAPI docs
- Router-based modularization (by domain)
- Pydantic schemas for request/response
- Service layer for business logic
- Dependency injection for shared resources

### 6.3 ML Pipeline

**Model Types**:
- Linear Regression (baseline)
- Ridge Regression (primary, with regularization)

**Feature Engineering** (9 configurable methods):
1. Lag Features (1h, 2h, 3h, 6h, 12h, 24h)
2. Rolling Statistics (mean, std, min, max)
3. Rate of Change (water level diff)
4. Time Features (hour, day, month, cyclical encoding)
5. Rainfall Aggregations (1h, 6h, 12h, 24h)
6. Weather Features (temperature, humidity, pressure)
7. Wind Features (speed, direction)
8. Interaction Features (rain × temperature)
9. Historical Averages

**MLflow Integration**:
- Experiment tracking (params, metrics, artifacts)
- Model registry (versioning, staging, production)
- Artifact storage (models, scalers, feature configs)
- PostgreSQL backend for metadata
- File system for artifacts

### 6.4 Database & Storage

**Primary Database**: Supabase (managed PostgreSQL 14+)
- Row Level Security (RLS) enabled on all tables
- Custom `authorize()` function for RBAC
- Generated TypeScript types via Supabase CLI
- Real-time subscriptions (optional)
- Edge Functions for serverless operations

**Extensions**:
- `pg_cron`: Scheduled jobs (data sync)
- `pg_net`: HTTP requests from database
- `uuid-ossp`: UUID generation
- `pgcrypto`: Cryptographic functions

**MLflow Storage**:
- Backend Store: PostgreSQL (mlflow-postgres container)
- Artifact Store: File system (`/app/mlartifacts`)

### 6.5 DevOps & Tooling

**Monorepo Management**:
- Turborepo: Build orchestration with caching
- pnpm 10: Fast, disk-efficient package manager
- Workspace Protocol: Cross-package dependencies

**Containerization**:
- Docker: Multi-stage builds for production
- Docker Compose: Local development orchestration
- Shared networks and volumes
- Health checks for service dependencies

**Code Quality**:
- TypeScript: Strict mode with noEmit checks
- ESLint: Linting rules for Next.js
- Prettier: Code formatting
- Git hooks (optional): Pre-commit checks

---

## 7. Security & Authorization

### 7.1 Authentication Strategy

**Provider**: Supabase Auth (built-in)

**Methods Supported**:
- Email/Password (currently active)
- OAuth providers (configurable)
- Magic links (configurable)

**Session Management**:
- JWT tokens stored in HTTP-only cookies
- Server-side validation via `createClient()`
- 1-hour expiry with automatic refresh

### 7.2 Row Level Security (RLS)

**Design Philosophy**: Database is the source of truth for authorization

**Implementation**:
- All tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Policies use `auth.uid()` to identify current user
- `authorize(permission, user_id)` function validates via role_permissions join
- Policies are declarative and auditable

**Policy Patterns**:
```sql
-- Public read access
CREATE POLICY "Allow public read" ON [table]
    FOR SELECT USING (true);

-- Admin-only write
CREATE POLICY "Allow admin write" ON [table]
    FOR INSERT WITH CHECK (authorize('data.manage', auth.uid()));

-- Expert-level access
CREATE POLICY "Allow expert access" ON [table]
    FOR ALL USING (
        authorize('models.tune', auth.uid()) OR 
        authorize('data.manage', auth.uid())
    );
```

### 7.3 Frontend Security

**Route Protection**:
- Middleware redirects unauthenticated users to `/auth/login`
- Protected pages check `role` and redirect if insufficient
- Server Actions validate auth before mutations

**Data Access**:
- Client-side Supabase queries respect RLS
- Server Actions use server-side client with service role (when needed)
- Sensitive operations (user management) require admin role

**Environment Variables**:
- Public vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- Server-only vars: `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### 7.4 API Security

**ML API Service**:
- No public endpoints (only accessible via internal network)
- CORS configured for Next.js origin only
- Supabase service role key for database access
- Input validation via Pydantic schemas

**MLflow Server**:
- Internal network only (not exposed publicly)
- PostgreSQL credentials via environment variables
- Artifact access restricted to service layer

---

## 8. Operational Workflows

### 8.1 Model Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Training: Manual/Auto Trigger
    Training --> Evaluation: Training Complete
    Evaluation --> Registration: Metrics Logged
    Registration --> Staged: Auto-Register
    Staged --> Production: Admin Activation
    Production --> Prediction: Active Model
    Prediction --> Production: Continuous Use
    Production --> Retired: New Model Activated
    Retired --> [*]
    
    note right of Training
        - Fetch historical data
        - Feature engineering
        - Train multiple horizons
    end note
    
    note right of Registration
        - MLflow Model Registry
        - Versioning (auto-increment)
        - Name: swfm-{type}-{station}-{horizon}
    end note
    
    note right of Production
        - Update active_models table
        - Admin/Expert approval required
        - One model per horizon
    end note
```

### 8.2 Data Pipeline Operations

**Daily Operations**:
- **00:00-23:45**: Sync station measurements every 15 minutes (96 syncs/day)
- **Every hour**: Sync weather data for all active stations (24 syncs/day)
- **Every 60 minutes**: Auto-trainer runs (trains + predicts)

**Data Quality**:
- Measurements have `status` field (verified/pending/rejected)
- Duplicate prevention via `UNIQUE(station_id, measured_at)`
- Soft deletes on stations preserve historical data
- Sync logs track success/error counts

### 8.3 Monitoring & Observability

**Application Logs**:
- Next.js: Console logs in browser, server logs in Docker
- ML API: Uvicorn access logs + application logs
- MLflow: Tracking server logs

**Docker Logs**:
```bash
# View all services
docker compose logs -f

# View specific service
docker compose logs -f ml-api
docker compose logs -f mlflow
```

**Database Monitoring**:
- Supabase Studio: Local dashboard at `http://localhost:54323`
- pg_cron logs in `cron.job_run_details`
- sync_logs table for external API status

**MLflow UI**:
- Experiment tracking: `http://localhost:5000`
- Model registry versioning
- Metrics comparison across runs

### 8.4 Deployment Workflow

**Local Development**:
1. Start Supabase: `pnpx supabase start`
2. Run database migrations: `pnpx supabase db reset`
3. Start web app: `pnpm dev` (Turborepo)
4. (Optional) Start ML service: `cd apps/ml-service && bash start_ml_service.sh`

**Docker Production**:
1. Configure environment variables (`.env` file)
2. Build and start: `docker compose up -d --build`
3. Verify health: Check logs and service endpoints
4. Initialize data: Run initial sync manually or wait for cron

**Database Migrations**:
- Managed by Supabase CLI
- Versioned SQL files in `supabase/migrations/`
- Applied in order by timestamp prefix
- Rollback via `supabase db reset` (dev only)

### 8.5 Scaling Considerations

**Horizontal Scaling**:
- Next.js: Stateless, can replicate behind load balancer
- ML API: Stateless prediction service, can scale with multiple instances
- MLflow: Single instance (artifact storage on shared volume)

**Database Optimization**:
- Indexed foreign keys and timestamp columns
- Partitioning for large tables (station_measurements, forecasts)
- Connection pooling via Supabase Pooler

**Caching Strategy**:
- Turborepo: Build cache for faster rebuilds
- Next.js: Static generation for public pages
- ML models: Loaded once per container lifecycle

---

## Appendix: Key File Locations

### Configuration Files
- `docker-compose.yml` - Service orchestration
- `turbo.json` - Build pipeline configuration
- `pnpm-workspace.yaml` - Monorepo workspace definition
- `apps/web/next.config.mjs` - Next.js configuration
- `apps/ml-service/requirements.txt` - Python dependencies

### Database Migrations
- `supabase/migrations/` - All database schema changes (ordered by timestamp)
- `supabase/seed.sql` - Initial data (stations, permissions)

### Application Code
- `apps/web/app/` - Next.js App Router pages
- `apps/web/components/` - React components
- `apps/web/lib/supabase/` - Database client and types
- `apps/ml-service/app/` - FastAPI application
- `apps/ml-service/app/routers/` - API endpoints
- `apps/ml-service/app/services/` - Business logic

### Infrastructure
- `apps/mlflow/Dockerfile` - Custom MLflow image
- `apps/web/Dockerfile` - Next.js production build
- `apps/ml-service/Dockerfile` - ML service image
- `.dockerignore` - Files excluded from Docker context
