.PHONY: up down build logs

# Starts local dev environment
up:
	docker compose -f docker-compose.dev.yml up -d

# Stops local dev environment
down:
	docker compose -f docker-compose.dev.yml down

# Rebuilds the containers (for new python dependencies)
build:
	docker compose -f docker-compose.dev.yml build

logs:
	docker compose -f docker-compose.dev.yml logs -f