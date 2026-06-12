FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 999 appuser && \
    useradd -r -u 999 -g appuser appuser
<<<<<<< HEAD
=======
USER appuser
>>>>>>> 5b90c2bd1dbf63592807d1493f2afb65a3608e33

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

COPY . .

RUN mkdir -p /app/staticfiles && \
    chown -R appuser:appuser /app

USER appuser

CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn liftinglog.wsgi:application --bind 0.0.0.0:8000"]