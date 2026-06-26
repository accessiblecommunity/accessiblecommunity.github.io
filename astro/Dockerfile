# Node v22 is the current LTS version.
FROM node:22-bullseye-slim AS base-node-image

###############################
FROM base-node-image AS dev-test

WORKDIR /website/astro

EXPOSE 4321
ENTRYPOINT ["tail", "-f", "/dev/null"]

###############################
# End-to-end test image. Uses the official Playwright image so the browsers and
# their system libraries are baked in and version-matched to @playwright/test.
# Keep this tag in sync with the resolved @playwright/test version in
# astro/package-lock.json (currently 1.61.1). If a test run reports a version
# mismatch, bump this tag to match and rebuild (`make build`).
FROM mcr.microsoft.com/playwright:v1.61.1-noble AS e2e

WORKDIR /website/astro

EXPOSE 4321
ENTRYPOINT ["tail", "-f", "/dev/null"]
