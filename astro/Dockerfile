# Node v18 is the current LTS version.
FROM node:18-buster-slim as base-node-image

###############################
FROM base-node-image AS dev-test

WORKDIR /website/astro

EXPOSE 4321
ENTRYPOINT ["tail", "-f", "/dev/null"]
