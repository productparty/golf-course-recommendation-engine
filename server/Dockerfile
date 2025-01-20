FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y gcc python3-dev libpq-dev

# Copy and install requirements
COPY requirements.txt .
RUN pip install --verbose --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Print debug info at startup
RUN echo "Python version:" && python --version && \
    echo "Installed packages:" && pip list

# Use explicit start command
CMD ["python", "-c", "import os; from app import app; import uvicorn; port = int(os.environ.get('PORT', 8000)); print(f'Starting server on port {port}'); uvicorn.run(app, host='0.0.0.0', port=port, log_level='debug')"]