.PHONY: ci build test lint format clean

ci: lint test
	@echo "[pass] ci"

build:
	bun run build

test:
	bun run test

lint:
	bun run lint

format:
	bun run format

clean:
	bun run clean
