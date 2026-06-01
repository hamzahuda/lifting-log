FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

COPY . .

RUN mkdir -p /app/staticfiles

CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn liftinglog.wsgi:application --bind 0.0.0.0:8000"]