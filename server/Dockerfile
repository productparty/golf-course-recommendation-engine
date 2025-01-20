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

# Add startup script
RUN echo '#!/bin/bash\n\
echo "Waiting for port $PORT to be available..."\n\
timeout=30\n\
until nc -z localhost $PORT || [ $timeout -le 0 ]; do\n\
  echo "Port $PORT is not available, waiting..."\n\
  sleep 1\n\
  timeout=$((timeout-1))\n\
done\n\
\n\
exec uvicorn app:app \
  --host 0.0.0.0 \
  --port $PORT \
  --workers $MAX_WORKERS \
  --log-level debug \
  --timeout-keep-alive 75 \
  --proxy-headers \
  --forwarded-allow-ips="*"' > /app/start.sh && \
  chmod +x /app/start.sh

# Print debug info
RUN echo "Python version:" && python --version && \
    echo "Installed packages:" && pip list

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start command
CMD ["/app/start.sh"]