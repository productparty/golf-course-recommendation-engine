FROM python:3.10-slim

WORKDIR /server

# Install build dependencies
RUN apt-get update && \
    apt-get install -y gcc python3-dev libpq-dev netcat-traditional curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

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

# List contents of /server for debugging
RUN ls -la /server

# Ensure start.sh is executable (if it exists)
RUN if [ -f start.sh ]; then chmod +x start.sh; fi

# Create start.sh file if it doesn't exist
RUN if [ ! -f start.sh ]; then \
    echo '#!/bin/bash' > start.sh && \
    echo 'PORT="${PORT:-8000}"' >> start.sh && \
    echo 'echo "Starting server on port: $PORT"' >> start.sh && \
    echo 'exec uvicorn app:app --host 0.0.0.0 --port "$PORT" --workers 4 --log-level debug' >> start.sh && \
    chmod +x start.sh; \
    fi

# Print debug info
RUN echo "Python version:" && python --version && \
    echo "Installed packages:" && pip list

# Health check using the PORT environment variable
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Use the start.sh script
CMD ["./start.sh"]
