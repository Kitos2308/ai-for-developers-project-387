.PHONY: install dev build preview check build.frontend clean start migrate.gen migrate.up migrate.down e2e.install e2e.test e2e.test.api e2e.test.ui e2e.test.headed e2e.report docker.build

export PATH := /opt/homebrew/bin:$(PATH)

FRONTEND_DIR := frontend
BACKEND_DIR := backend

install:
	cd $(FRONTEND_DIR) && npm install

dev:
	cd $(FRONTEND_DIR) && npm run dev

build: docker.build

build.frontend:
	cd $(FRONTEND_DIR) && npm run build

docker.build:
	docker compose build

docker.build.up:
	docker compose up -d --build

preview:
	cd $(FRONTEND_DIR) && npm run preview

check:
	cd $(FRONTEND_DIR) && npm run check

start:
	cd $(FRONTEND_DIR) && node build

clean:
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/.svelte-kit
	rm -rf $(FRONTEND_DIR)/dist

migrate.gen:
	cd $(BACKEND_DIR) && poetry run alembic revision --autogenerate -m "$(name)"

migrate.up:
	cd $(BACKEND_DIR) && (command -v poetry > /dev/null 2>&1 && poetry run alembic upgrade head || alembic upgrade head)

migrate.down:
	cd $(BACKEND_DIR) && poetry run alembic downgrade -1

backend.up:
	make migrate.up
	cd $(BACKEND_DIR) && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug

e2e.install:
	cd e2e && npm install && npx playwright install chromium

e2e.test:
	cd e2e && npx playwright test

e2e.test.api:
	cd e2e && npx playwright test --project=api

e2e.test.ui:
	cd e2e && npx playwright test --project=ui

e2e.test.headed:
	cd e2e && npx playwright test --project=ui --headed

e2e.report:
	cd e2e && npx playwright show-report
