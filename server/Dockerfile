FROM python:3.10-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install only the essential packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary files
COPY . .

# Set environment variables
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start command with logging
CMD echo "Starting server on port $PORT" && \
    python -c "import os; \
    print(f'Environment variables: PORT={os.environ.get(\"PORT\")}'); \
    port = int(os.environ.get('PORT', 8000)); \
    from app import app; \
    import uvicorn; \
    uvicorn.run(app, host='0.0.0.0', port=port, log_level='debug')"