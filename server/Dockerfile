FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

CMD ["python", "app.py"]