FROM python:3.10-slim

WORKDIR /app

# Install only the essential packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary files
COPY . .

# Set environment variable with a default
ENV PORT=8000

# Use shell form to expand $PORT variable
CMD python -c "import os; port = int(os.environ.get('PORT', 8000)); from app import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=port)"