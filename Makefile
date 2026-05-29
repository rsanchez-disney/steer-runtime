VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
RELEASE_REPO := rsanchez-disney/steer-runtime
TARBALL := steer-runtime-$(VERSION).tar.gz
ENCRYPTED := steer-runtime-$(VERSION).tar.gz.enc
RELEASE_KEY ?= $(STEER_RELEASE_KEY)

.PHONY: package release clean help

package: ## Create encrypted release tarball
	@echo "📦 Packaging steer-runtime $(VERSION)..."
	@tar -czf $(TARBALL) \
		--exclude='*.git*' \
		--exclude='node_modules' \
		--exclude='__pycache__' \
		--exclude='.DS_Store' \
		profiles/ \
		shared/ \
		common/ \
		workspaces/ \
		setup.sh \
		setup.ps1 \
		AGENTS.md \
		README.md
	@test -n "$(RELEASE_KEY)" || { echo "❌ Set STEER_RELEASE_KEY env var"; exit 1; }
	@openssl enc -aes-256-cbc -salt -pbkdf2 -in $(TARBALL) -out $(ENCRYPTED) -pass pass:$(RELEASE_KEY)
	@rm -f $(TARBALL)
	@echo "✅ $(ENCRYPTED) ($$(du -h $(ENCRYPTED) | cut -f1))"

release: package ## Tag + package + publish to github.com (make release TAG=v3.7.0)
	@test -n "$(TAG)" || { echo "Usage: make release TAG=v3.7.0"; exit 1; }
	@which gh > /dev/null 2>&1 || { echo "Install GitHub CLI: brew install gh"; exit 1; }
	git tag -a $(TAG) -m "Release $(TAG)"
	git push origin $(TAG)
	GH_HOST=github.com gh release create $(TAG) $(ENCRYPTED) \
		--repo $(RELEASE_REPO) \
		--title "steer-runtime $(TAG)" \
		--generate-notes
	@echo "\n✅ Published $(TAG) to github.com/$(RELEASE_REPO)"

clean: ## Remove build artifacts
	rm -f steer-runtime-*.tar.gz steer-runtime-*.tar.gz.enc

MCP_DIR := shared/tools/mcp-servers
MCP_SERVERS := $(wildcard $(MCP_DIR)/*/package.json)

mcp-build: ## Build all MCP server dist bundles (parallel)
	@echo "🔨 Building MCP server bundles (parallel)..."
	@pids=""; fails=0; \
	for pkg in $(MCP_SERVERS); do \
		dir=$$(dirname $$pkg); \
		name=$$(basename $$dir); \
		( cd $$dir && npm install --silent 2>/dev/null && \
			if npm run --silent bundle 2>/dev/null; then true; \
			elif npm run --silent build 2>/dev/null; then true; \
			else true; fi && \
			if [ -f dist/index.cjs ]; then echo "  ✅ $$name"; \
			else echo "  ⚠ $$name (no dist/index.cjs)"; exit 1; fi \
		) & \
		pids="$$pids $$!"; \
	done; \
	for pid in $$pids; do wait $$pid || fails=$$((fails+1)); done; \
	if [ $$fails -gt 0 ]; then echo "⚠ $$fails server(s) failed"; else echo "✅ MCP build complete"; fi

mcp-build-%: ## Build a single MCP server (e.g., make mcp-build-jira-mcp)
	@dir=$(MCP_DIR)/$*; \
	test -f "$$dir/package.json" || { echo "❌ $$dir/package.json not found"; exit 1; }; \
	echo "🔨 Building $*..."; \
	cd $$dir && npm install --silent 2>/dev/null && \
		if npm run --silent bundle 2>/dev/null; then true; \
		elif npm run --silent build 2>/dev/null; then true; \
		else echo "⚠ no build/bundle script"; fi; \
	echo "✅ $*"

validate-catalog: ## Validate managed services catalog app.yaml files and report fill-rate
	@./scripts/validate-catalog.sh

validate-workspaces: ## Validate all workspace.json files for required fields and portability
	@./scripts/validate-workspaces.sh

validate-agents: ## Validate all agent JSONs reference existing prompt files
	@./scripts/validate-agents.sh

validate-all: validate-workspaces validate-agents validate-catalog ## Run all validations

validate-catalog-strict: ## Validate catalog in strict mode (fails on missing required fields)
	@./scripts/validate-catalog.sh --strict

docs-deploy: ## Build and deploy mkdocs to GitHub Pages
	python3 -m mkdocs gh-deploy --remote-name origin

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
