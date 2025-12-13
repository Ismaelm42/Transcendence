YML = docker-compose.yml

MAKEFLAGS += --no-print-directory

all:
	@bash -c '\
	if [ ! -f .env ]; then \
		echo ".env file not found in the project directory."; \
		echo "Enter the full path to your .env file:"; \
		read -r env_path; \
		if [ ! -f "$$env_path" ]; then \
			echo "The provided file does not exist. Aborted."; \
			exit 1; \
		fi; \
		cp "$$env_path" .env; \
		if [ ! -f .env ]; then \
			echo "Failed to copy the .env file."; \
			exit 1; \
		fi; \
		echo ".env file copied successfully."; \
	fi; \
	docker compose -f ${YML} up -d \
	'
	@cd frontend/src && npm install && cd ts && npx tsc
	@cd frontend/src && npm install && npx @tailwindcss/cli -i ./css/input.css -o ./css/output.css

down:
	@bash -c '\
	if [ ! -f .env ]; then \
		echo ".env file not found in the project directory. Aborted"; \
	else \
		docker compose -f ${YML} down; \
	fi; \
	'

clean:
	@docker system prune -af

fclean:
	@bash -c '\
	if [ ! -f .env ]; then \
		echo ".env file not found in the project directory. Aborted"; \
	else \
		${MAKE} down && ${MAKE} clean; \
	fi; \
	'

delete-db:
	@rm -rf backend/database/database.sqlite

purge:
	@bash -c '\
	if [ ! -f .env ]; then \
		echo ".env file not found in the project directory. Aborted"; \
	else \
		${MAKE} fclean && ${MAKE} delete-db; \
	fi; \
	'

delete-all:
	@sudo rm -rf frontend/src/package-lock.json
	@sudo rm -rf frontend/src/node_modules
	@sudo rm -rf backend/package-lock.json
	@sudo rm -rf backend/node_modules
	@sudo rm -rf .env

purge-all:
	@bash -c '\
	echo "You are about to DELETE ALL dependencies, the database, and the .env file."; \
	read -p "Are you sure? (yes/NO): " confirm; \
		if [ "$$confirm" = "yes" ] || [ "$$confirm" = "y" ]; then \
		$(MAKE) purge && $(MAKE) delete-all; \
	else \
		echo "Aborted"; \
	fi; \
	'

re: fclean all

ts:
	@cd frontend/src/ts && npx tsc -w

tailwind:
	@cd frontend/src && npx @tailwindcss/cli -i ./css/input.css -o ./css/output.css --watch

cli:
	@node backend/game/manager/gameCLI.js

PHONY: all down clean fclean purge purge-all re

#ISM: !!!PURGE-ALL!!! will not work at 42 Campus. If you want to delete the backend/node_modules files, you need to do it manually in the backend container.
