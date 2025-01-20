FROM python:3.10-slim

WORKDIR /app

COPY server/requirements.txt .
RUN pip install -r requirements.txt

COPY server .

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

CMD ["python", "app.py"]