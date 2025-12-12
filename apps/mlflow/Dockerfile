FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install MLflow and PostgreSQL adapter
RUN pip install --no-cache-dir \
    mlflow==2.9.0 \
    psycopg2-binary

WORKDIR /app

# Create artifacts directory
RUN mkdir -p /app/mlartifacts

EXPOSE 5000

# Default command (can be overridden in docker-compose)
CMD ["mlflow", "server", \
     "--host", "0.0.0.0", \
     "--port", "5000"]
