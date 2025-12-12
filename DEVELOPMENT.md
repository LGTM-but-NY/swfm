# Development Guide

Welcome to the SWFM project! This guide will help you set up your development environment and get started.

## Prerequisites

- **Node.js**: v22.10.0 or higher
- **Docker**: Required for running Supabase and services
- **pnpm**: v10.25.0 or higher (Package manager)
- **Python**: 3.11+ (for local ML service development)

## Project Structure

This is a **monorepo** managed by Turborepo with the following structure:

```
swfm/
├── apps/
│   ├── web/              # Next.js frontend application
│   ├── ml-service/       # FastAPI ML service
│   └── mlflow/           # MLflow tracking server
├── supabase/             # Database migrations and config
├── docker-compose.yml    # Full stack orchestration
├── turbo.json           # Turborepo configuration
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/LGTM-but-NY/swfm.git
cd swfm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Supabase

Start the local Supabase instance. This will spin up the database, authentication, and other services in Docker containers.

```bash
pnpx supabase start
```

> **Note**: Ensure Docker is running before executing this command.

### 4. Configure Environment Variables

After Supabase starts successfully, it will output the API URL and keys. You need to configure your environment variables.

#### For Web App (Next.js)

1.  Copy the example environment file:
    ```bash
    cp example.env apps/web/.env.local
    ```

2.  Update `apps/web/.env.local` with the values from the `supabase start` output:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
    ML_SERVICE_URL=http://localhost:8000
    ```

#### For ML Service (Optional - for local ML development)

```bash
cp apps/ml-service/example.env apps/ml-service/.env
```

Update with your Supabase credentials if needed.

### 5. Run the Development Server

#### Option A: Run Web App Only (Recommended for Frontend Development)

```bash
pnpm dev
```

This uses Turborepo to start the Next.js development server at [http://localhost:3000](http://localhost:3000).

#### Option B: Run Full Stack with Docker

To run the entire application stack (Next.js, ML Service, MLflow, PostgreSQL):

```bash
docker compose up -d --build
```

Services will be available at:
- **Next.js**: http://localhost:3000
- **ML API**: http://localhost:8000/docs
- **MLflow UI**: http://localhost:5000
- **PostgreSQL**: localhost:5432

To stop all services:
```bash
docker compose down
```

#### Option C: Run ML Service Locally (for ML Development)

```bash
cd apps/ml-service
bash start_ml_service.sh
```

See [apps/ml-service/README.md](apps/ml-service/README.md) for detailed ML service documentation.

## Development Workflows

### Frontend Development

```bash
# Run in dev mode with hot reload
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

### Working with Specific Apps

```bash
# Run only the web app
turbo dev --filter=web

# Build only the web app
turbo build --filter=web
```

## User Roles & First Sign-Up

The application has role-based access control (RBAC).

- **Admin**: Full access to all features, including User Management and Data Management.
- **Expert**: Access to Expert Tools (Advanced Modeling, Tuning, Evaluation) and the Dashboard.
- **Guest**: Limited access (Dashboard only).

### Important Note on First Sign-Up

**The first user to sign up in the system is automatically assigned the `admin` role.**

Subsequent users will be assigned the `guest` role by default and must be promoted by an Admin via the User Management page.

## Database Management

### Viewing the Database

Access Supabase Studio at [http://localhost:54323](http://localhost:54323) to view and manage your database.

### Generating TypeScript Types

If you make changes to the database schema, regenerate the TypeScript types:

```bash
pnpm db:gen-types
```

This ensures that your application code stays in sync with your database schema.

### Running Migrations

```bash
# List migrations
pnpx supabase migration list

# Reset database (WARNING: destroys data)
pnpx supabase db reset

# Create a new migration
pnpx supabase migration new migration_name
```

## Useful Commands

### Turborepo

```bash
# Run dev for all apps
turbo dev

# Build all apps
turbo build

# Clear Turborepo cache
turbo prune
```

### Docker

```bash
# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f nextjs
docker compose logs -f ml-api
docker compose logs -f mlflow

# Restart a service
docker compose restart nextjs

# Rebuild and restart
docker compose up -d --build --force-recreate
```

## Troubleshooting

### Port Already in Use

If you get port conflicts:
- **3000**: Next.js - Stop other apps using this port
- **5432**: PostgreSQL - Stop other PostgreSQL instances
- **8000**: ML API - Stop other FastAPI apps
- **5000**: MLflow - Stop other MLflow instances

### Docker Issues

```bash
# Remove all containers and volumes
docker compose down -v

# Clean up Docker system
docker system prune -a
```

### Supabase Issues

```bash
# Stop Supabase
pnpx supabase stop

# Start fresh
pnpx supabase start
```

## Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [MLflow Documentation](https://mlflow.org/docs/latest/index.html)
