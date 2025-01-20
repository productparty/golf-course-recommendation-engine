FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y gcc python3-dev libpq-dev netcat-traditional

# Copy only what's needed
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
# Add CORS environment variable
ENV ALLOWED_ORIGINS="https://golf-club-ui.vercel.app"

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD nc -z localhost $PORT || exit 1

# Print debug info at startup
RUN echo "Python version:" && python --version && \
    echo "Installed packages:" && pip list

# Use longer timeouts and workers for production
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT} --workers 4 --timeout-keep-alive 75 --proxy-headers --forwarded-allow-ips='*'"]