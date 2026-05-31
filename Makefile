# Simple Makefile for a Go project

# Build the application
all: build test

build:
	@echo "Building..."
	@npm run build --prefer-offline --no-fund --prefix ./frontend
	@go build -o main cmd/api/main.go
	./main

# Run the application
run:
	@go run cmd/api/main.go &
	@npm install --prefer-offline --no-fund --prefix ./frontend
	@npm run dev --prefix ./frontend
# Create DB container
docker-run:
	@if docker compose up --build 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose up --build; \
	fi

# Shutdown DB container
docker-down:
	@if docker compose down 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose down; \
	fi

# Test the application
test:
	@echo "Testing..."
	@go test ./... -v

# Integrations Tests for the application
vitest:
	@echo "Running integration tests..."

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main

# Generate SQLC bindings
gen:
	@echo "SQLC Generate Running...💾"
	@sqlc generate



