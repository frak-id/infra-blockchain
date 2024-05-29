# Base image is node-22
FROM node:22-slim as base

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Create app directory
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
# install python and all the stuff required to build sqlite3
RUN apt-get update
RUN apt-get install -y \
            python3 \
            build-essential

# Install dependencies
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && pnpm --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM base AS release

# Set env to production
ENV NODE_ENV production

# copy production dependencies and source code into final image
COPY . .
COPY --from=install /temp/prod/node_modules node_modules

# Run a final codegen to have fresh generated schema and stuff
RUN pnpm run build

# Allow node user to everything in the working directory, and switch to it
RUN chown node:node ./
USER node

# run the app
EXPOSE 42069/tcp
# ENTRYPOINT [ "pnpm", "run", "start" ]
ENTRYPOINT [ "bash" ]