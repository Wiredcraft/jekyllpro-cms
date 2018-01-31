NODE_BIN = ./node_modules/.bin
MOCHA_OPTS = -b --timeout 10000 --reporter spec

# Linting and testing
lint:
	@echo "Linting..."
	@$(NODE_BIN)/standard --verbose | $(NODE_BIN)/snazzy
fix:
	@echo "Fixing lint..."
	@$(NODE_BIN)/standard --fix --verbose | $(NODE_BIN)/snazzy
pretty:
	@echo "Making it prettier..."
	@$(NODE_BIN)/prettier --single-quote --write 'client/src/**/*.js'
.PHONY: lint fix pretty

# Development
server_dev:
	@NODE_ENV=development $(NODE_BIN)/nodemon ./server --ignore client/ --ignore public/
webpack-watch:
	@rm -rf ./public/dev
	@NODE_ENV=development $(NODE_BIN)/webpack --config client/webpack/development.js --watch --watch-poll
dev:
	@$(NODE_BIN)/concurrently --kill-others "make server_dev" "make webpack-watch"
.PHONY: server_dev dev webpack-watch dev-static webpack-shared-watch dev-all

# Deployment
build:
	@echo "Building frontend files..."
	@rm -rf ./public/dist
	@mkdir -p ./public/dist
	@NODE_ENV=production $(NODE_BIN)/webpack --config client/webpack/production.js --progress --bail
.PHONY: build
