VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
RELEASE_REPO := rsanchez-disney/steer-runtime
TARBALL := steer-runtime-$(VERSION).tar.gz

.PHONY: package release clean help

package: ## Create release tarball
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
	@echo "✅ $(TARBALL) ($$(du -h $(TARBALL) | cut -f1))"

release: package ## Tag + package + publish to github.com (make release TAG=v3.7.0)
	@test -n "$(TAG)" || { echo "Usage: make release TAG=v3.7.0"; exit 1; }
	@which gh > /dev/null 2>&1 || { echo "Install GitHub CLI: brew install gh"; exit 1; }
	git tag -a $(TAG) -m "Release $(TAG)"
	git push origin $(TAG)
	GH_HOST=github.com gh release create $(TAG) $(TARBALL) \
		--repo $(RELEASE_REPO) \
		--title "steer-runtime $(TAG)" \
		--notes "## Install\n\n\`\`\`bash\ncurl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash\nkoda install dev\n\`\`\`\n\n50 agents · 7 profiles · 16 rules · 7 skills"
	@echo "\n✅ Published $(TAG) to github.com/$(RELEASE_REPO)"

clean: ## Remove build artifacts
	rm -f steer-runtime-*.tar.gz

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
