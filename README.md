# Accessible Community's Website

Our main website is developed using [Astro](https://docs.astro.build).

## Setting up a Development Environment

On almost every project, getting your development environment established is the first task and it can take a day or two to do so. This is a high-level overview so that you can be productive quickly.

If you don't have one, we recommend installing an IDE that supports multiple languages (Python, Javascript, HTML/CSS, etc). The recommendations are [VS Code](https://code.visualstudio.com/) or [Sublime Text](https://www.sublimetext.com/), but this is a developer choice.

The next step is to determine which development environment you would like to use. You can choose between a couple of options:

1) Running in a Docker container.
2) A direct Node.js install.

### Setting up a Development Environment using Docker.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) or another way to run a containerized environment.
  * If on Windows, we recommend installing the [Linux Subsystem](https://learn.microsoft.com/en-us/windows/wsl/install) to help performance, but it’s not required. See [configuring Docker Desktop to use WSL 2](https://docs.docker.com/desktop/wsl/).
2. There are a series a `make` commands to help you run the commands in Docker. To use those, you'll need a way to run `make`.
  * On Windows, use the Linux Subsystem or [chocolatey](https://chocolatey.org/).
  * On Mac, install the Xcode client tools or use [homebrew](https://brew.sh/).
  * If preferred, install some integration with the IDE you are using instead.
    * For instance, [`Makefile` support for VS Code](https://devblogs.microsoft.com/cppblog/now-announcing-makefile-support-in-visual-studio-code/)
3. Run `make serve` to launch the container, install the dependencies and run the development server.

#### Running the end-to-end tests in Docker

The Playwright tests run in a dedicated container (the official Playwright image, with the browsers and their system libraries baked in). It is gated behind the `e2e` Compose profile, so it is not built or started by `make serve` — you only pay for it when you run the tests. You do **not** need the site running (locally or via `make serve`) first; the tests start their own dev server inside the container.

1. Run `make test-e2e`. This builds/starts the `e2e` container, installs its dependencies the first time, and runs the Playwright suite.
2. Run `make report-e2e` to view the HTML report from the last run. It is served from the container at <http://localhost:9323> (press Ctrl-C to stop) — no local Playwright install required.

The e2e container keeps its own `node_modules` in a Docker volume rather than sharing the host's. This is required because Rollup/esbuild ship per-OS native binaries: a macOS host `node_modules` cannot run in the Linux container. It also means running the tests will not disturb the `node_modules` you use for local development.

### Setting up a Development Environment using Node.

1. Install the [LTS version of Node](https://nodejs.org/en/download/prebuilt-installer/current) on your development machine.
2. Run `npm install` from the `site` directory to install the JS dependencies.
3. Run `npm run dev` from the `site` directory to run the development server.

#### Running the end-to-end tests with Node

The Playwright tests need a browser. Without Docker, install it once with:

```sh
npm run playwright:check
```

This runs `playwright install --with-deps`, which downloads the browser binaries. The `--with-deps` flag also installs the required system libraries on Linux (it is a no-op on macOS/Windows and may prompt for `sudo` on Linux). Then run the suite with:

```sh
npm run test:e2e          # run the tests headless
npm run test:e2e:ui       # run with the Playwright UI
npm run test:e2e:report   # open the HTML report from the last run
```

## Troubleshooting

### Switching between `make serve` (Docker) and `npm run dev` (local) breaks the build

If you run the app **both** ways, you may hit an error like:

```
Error: Cannot find module @rollup/rollup-linux-arm64-gnu
```

(or the `darwin`/`win32` equivalent, or `sh: 1: astro: not found`).

**Why:** `make serve` runs the app in a Linux container, while `npm run dev` runs it
directly on your machine (e.g. macOS). Both share the **same** `astro/node_modules`
folder, but Rollup and esbuild install **per-OS native binaries**. Whichever
environment installed dependencies last wins, so the other one can no longer find the
binary built for its platform.

**Fix:** reinstall dependencies for the environment you are switching *to* — you do
not need to (and on macOS often cannot) delete `node_modules` first; reinstalling
overwrites the platform-specific packages in place.

- Switching to **local** (`npm run dev`): run `npm install` from the `astro` directory.
- Switching to **Docker** (`make serve`): reinstall inside the container, e.g.
  `docker compose exec website sh -c "npm install"`.

If you really want to clear `node_modules` and Docker Desktop reports "Permission
denied" deleting it from macOS, remove its contents from inside the container instead:
`docker compose exec website sh -c "rm -rf node_modules/*"`, then reinstall.

> The Playwright e2e container is **not** affected — it keeps its own `node_modules`
> in a Docker volume, so `make test-e2e` works regardless of what is installed locally.
