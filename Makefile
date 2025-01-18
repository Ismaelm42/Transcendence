YML = docker-compose.yml

all:
	@docker compose -f ${YML} up -d

down:
	@docker compose -f ${YML} down

clean:
	@docker system prune -af

fclean: down clean

re: down all

PHONY: all down clean fclean re
