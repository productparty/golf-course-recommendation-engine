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

# Set environment variables (without VITE_ prefix)
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
ENV DB_HOST=aws-0-us-east-2.pooler.supabase.com
ENV DB_PORT=6543
ENV DB_NAME=postgres
ENV DB_USER=postgres.nkknwkentrbbyzgqgpfd
ENV DB_PASSWORD=Watso3mj16!
ENV SUPABASE_URL=https://nkknwkentrbbyzgqgpfd.supabase.co
ENV SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra253a2VudHJiYnl6Z3FncGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzA4MzYsImV4cCI6MjA1MjgwNjgzNn0.OyizXugP02ciUdXTOWxfTrp1HwsMgBM7FyeJ8le0_mM
ENV AZURE_MAPS_API_KEY=9NGtm5ACQVDOOMBQ4lZRzoE2J5JxN9st9uSftyEvjmaMpyrSZ247JQQJ99ALACYeBjFulBLoAAAgAZMP103l

# Show installed packages
RUN pip list

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]