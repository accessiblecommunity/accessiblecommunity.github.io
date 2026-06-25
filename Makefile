CONTAINER = website
SOURCE_DIR = ${CURDIR}/astro

# The OS environment variable is always defined by windows.
ifdef OS
	WriteCmd = <nul set /p=
	RemoveCmd = del /Q
	RemoveDirCmd = rmdir /Q /S
	FixPath = $(subst /,\,$1)
# The set command will return an error, even though it succeeds.
else
	WriteCmd = printf
	RemoveCmd = rm -rf
	RemoveDirCmd = rm -rf
	FixPath = $1
endif

E2E_CONTAINER = e2e

serve: up $(SOURCE_DIR)/node_modules
	@docker compose exec $(CONTAINER) sh -c "npm run dev"

test-e2e: up-e2e
	@echo Installing JS dependencies in the e2e container if needed.
	@docker compose exec $(E2E_CONTAINER) sh -c "[ -d node_modules/@playwright/test ] || npm install"
	@echo Running Playwright end-to-end tests.
	@docker compose exec $(E2E_CONTAINER) sh -c "npm run test:e2e"; status=$$?; \
		printf '\nTo view the HTML report from Docker, run: make report-e2e\n'; \
		printf '(Ignore the "npx playwright show-report" hint above -- that is the non-Docker command.)\n'; \
		exit $$status

report-e2e: up-e2e
	@echo Serving the Playwright HTML report at http://localhost:9323 -- press Ctrl-C to stop.
	@docker compose exec $(E2E_CONTAINER) sh -c "npx playwright show-report --host 0.0.0.0 --port 9323"

up-e2e:
	@docker compose --profile e2e up --detach $(E2E_CONTAINER)

up:
	@docker compose up --detach

down:
	@docker compose down

shell: up
	@docker compose exec $(CONTAINER) bash

dist: clean-js-dist $(SOURCE_DIR)/dist

check: up $(SOURCE_DIR)/node_modules
	@docker compose exec $(CONTAINER) sh -c "npm run astro:check"

prettier: up
	@echo Verifying code formatting.
	@docker compose exec $(CONTAINER) sh -c "npx prettier ./src --write"

version: up
ifndef number
	$(error Please define a 'number' that represents the new version)
endif
	docker compose exec $(CONTAINER) sh -c "npm version ${number}"

upgrade-astro: up $(SOURCE_DIR)/node_modules
	@echo Updating Astro specific dependencies.
	@docker compose exec ${CONTAINER} sh -c "npx @astrojs/upgrade"

update-dependencies: up $(SOURCE_DIR)/node_modules
	@echo Updating package.json.
	@docker compose exec ${CONTAINER} sh -c "npx npm-check-updates -u"

build:
	@docker compose build

$(SOURCE_DIR)/node_modules:
	@echo Installing JS dependencies. This will take awhile.
	docker compose exec $(CONTAINER) sh -c "npm install"

$(SOURCE_DIR)/dist: up $(SOURCE_DIR)/node_modules
	@echo Running a local build.
	@docker compose exec $(CONTAINER) sh -c "npm run build"

clean-astro-content:
	@echo Removing the Astro content directories.
	@$(RemoveDirCmd) $(call FixPath,$(SOURCE_DIR)/.astro)
	@$(RemoveDirCmd) $(call FixPath,$(SOURCE_DIR)/node_modules/.astro-og-canvas)

clean-js-dist:
	@echo Removing the $(SOURCE_DIR)/dist directory.
	@$(RemoveDirCmd) $(call FixPath,$(SOURCE_DIR)/dist)

clean-js-modules:
	@echo Removing the $(SOURCE_DIR)/node_modules directory.
	@$(RemoveDirCmd) $(call FixPath,$(SOURCE_DIR)/node_modules)

clean: clean-js-dist clean-js-modules

.PHONY: serve test-e2e report-e2e up up-e2e down build shell dist version \
	clean clean-astro-content clean-js-dist clean-js-modules \
	.FORCE
