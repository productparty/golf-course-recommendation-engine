#!/bin/bash

# Set default PORT if not provided
PORT="${PORT:-8000}"

# Print environment info
echo "Starting application..."
echo "HOSTNAME: $(hostname)"
echo "PORT: $PORT"

# Wait for port to be available
timeout=30
counter=0
while ! nc -z localhost $PORT; do
  if [ $counter -eq $timeout ]; then
    echo "Timed out waiting for port $PORT"
    exit 1
  fi
  echo "Waiting for port $PORT..."
  sleep 1
  ((counter++))
done

# Start the application
exec uvicorn app:app --host 0.0.0.0 --port "$PORT" --log-level debug --timeout-keep-alive 75
