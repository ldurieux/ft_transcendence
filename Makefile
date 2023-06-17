
all: down up

up: 
	docker compose up -d --build

down: 
	docker compose down -v

log: 
	docker compose logs api --follow