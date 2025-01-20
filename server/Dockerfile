FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y gcc python3-dev libpq-dev netcat-traditional curl

# Copy requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV ALLOWED_ORIGINS="https://golf-club-ui.vercel.app"
ENV MAX_WORKERS=4

# Create a wrapper script that properly handles the PORT variable
RUN echo '#!/bin/bash\n\
PORT="${PORT:-8000}"\n\
echo "Starting server on port: $PORT"\n\
exec uvicorn app:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --workers 4 \
    --log-level debug' > /app/start.sh && \
    chmod +x /app/start.sh

# Print debug info
RUN echo "Python version:" && python --version && \
    echo "Installed packages:" && pip list

# Health check using the PORT environment variable
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Use the wrapper script
CMD ["/bin/bash", "/app/start.sh"]