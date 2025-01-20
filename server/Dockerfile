FROM python:3.10-slim

WORKDIR /app

# Install only the essential packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary files
COPY app.py .
COPY utils/ utils/

# Set environment variable
ENV PORT=8000

# Start the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]