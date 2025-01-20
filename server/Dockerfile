FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

ENV PYTHONUNBUFFERED=1

# Let Railway handle the CMD