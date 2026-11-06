FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (build-essential, libpq-dev for psycopg2/asyncpg, curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create directory for DuckDB uploads and app data
RUN mkdir -p /data && chmod 777 /data

# Copy backend source
COPY . .

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

