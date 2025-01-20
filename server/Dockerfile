FROM python:3.10-slim

WORKDIR /app

# Install only the essential packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary files
COPY . .

# Set environment variable
ENV PORT=8000

# Start command
CMD ["python", "app.py"]