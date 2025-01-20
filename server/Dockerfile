# Base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set PYTHONPATH
ENV PYTHONPATH=/app

# Copy project requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Set the command to run FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]