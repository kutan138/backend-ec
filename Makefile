.PHONY: help

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

# Variables
ENV ?= local
COMPOSE_FILES := -f docker-compose.yml -f docker-compose.$(ENV).yml
ENV_FILE := --env-file .env.$(ENV)

help:
	@echo "$(GREEN)NestJS Docker Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC) make [command] ENV=[local|staging|production]"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev           - Start development (default: local)"
	@echo "  make dev-build     - Build and start development"
	@echo "  make dev-down      - Stop development"
	@echo "  make dev-logs      - View logs"
	@echo "  make dev-shell     - Shell into app container"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@echo "  make db-migrate    - Run migrations"
	@echo "  make db-seed       - Seed database"
	@echo "  make db-shell      - PostgreSQL shell"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make dev"
	@echo "  make dev ENV=staging"
	@echo "  make dev-logs ENV=production"

# Check if .env file exists
check-env:
	@if [ ! -f .env.$(ENV) ]; then \
		echo "$(RED)✗ .env.$(ENV) not found!$(NC)"; \
		echo "$(YELLOW)Creating from .env.example...$(NC)"; \
		cp .env.example .env.$(ENV); \
		echo "$(GREEN)✓ Created .env.$(ENV) - Please edit with your values$(NC)"; \
		exit 1; \
	fi

# Development
dev: check-env
	@echo "$(GREEN)Starting $(ENV) environment...$(NC)"
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) up

dev-build: check-env
	@echo "$(GREEN)Building and starting $(ENV) environment...$(NC)"
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) up --build

dev-down:
	@echo "$(YELLOW)Stopping $(ENV) environment...$(NC)"
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) down

dev-logs: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) logs -f

dev-shell: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) exec app sh

# Database
db-migrate: check-env
	@echo "$(GREEN)Running migrations...$(NC)"
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) exec app npm run migration:run

db-seed: check-env
	@echo "$(GREEN)Seeding database...$(NC)"
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) exec app npm run seed

db-shell: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) exec postgres psql -U $(shell grep DB_USER .env.$(ENV) | cut -d '=' -f2) -d $(shell grep DB_NAME .env.$(ENV) | cut -d '=' -f2)

# Testing
test: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) exec app npm run test

test-e2e: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) exec app npm run test:e2e

# Utility
ps: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) ps

restart: check-env
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) restart

clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose $(COMPOSE_FILES) $(ENV_FILE) down -v

# Show environment variables
show-env: check-env
	@echo "$(GREEN)Environment variables for $(ENV):$(NC)"
	@cat .env.$(ENV)