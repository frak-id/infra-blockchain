# Base stage
FROM node:22-slim AS base

# Setup bun (since we are on a node image)
RUN npm i -g bun

WORKDIR /usr/src/app

# Bun package installation
FROM base AS install

# Install prod dependencies
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --production


# Start a new stage for the final image
FROM base AS release

# todo: Ideally ponder would expose a bundler command or something like that to have a lighter docker image,
#  thus permitting to use more efficient runtime than vite (like a bun binary bundle)
# Copy the installed node_modules and the app
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

# Run the app
ENV NODE_ENV=production
EXPOSE 42069/tcp
ENTRYPOINT ["bun", "ponder", "start"]