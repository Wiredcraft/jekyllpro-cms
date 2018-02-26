NODE_BIN = ./node_modules/.bin

# Development
server_dev:
	@NODE_ENV=development $(NODE_BIN)/nodemon ./api/index.js --ignore client/ --ignore public/ --ignore api/indexFiles/
webpack-watch:
	@rm -rf ./public/dev
	@NODE_ENV=development $(NODE_BIN)/webpack --config client/webpack/development.js --watch --watch-poll --progress
dev:
	@$(NODE_BIN)/concurrently --kill-others "make server_dev" "make webpack-watch"
.PHONY: server_dev webpack-watch dev

# Deployment
build:
	@echo "Building frontend files..."
	@rm -rf ./public/dist
	@mkdir -p ./public/dist
	@NODE_ENV=production $(NODE_BIN)/webpack --config client/webpack/production.js --progress --bail
.PHONY: build
