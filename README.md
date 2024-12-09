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

### Setting up a Development Environment using Node.

1. Install the [LTS version of Node](https://nodejs.org/en/download/prebuilt-installer/current) on your development machine.
2. Run `npm install` from the `site` directory to install the JS dependencies.
3. Run `npm run dev` from the `site` directory to run the development server.