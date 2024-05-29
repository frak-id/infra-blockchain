# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM node:22 as base

# Set env to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

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
RUN cd /temp/prod && npm i

FROM base AS release

# Copy files as a non-root user. The `node` user is built in the Node image.
WORKDIR /usr/src/app
RUN chown node:node ./
USER node

# copy production dependencies and source code into final image
COPY . .
COPY --from=install /temp/prod/node_modules node_modules

# run the app
USER node
EXPOSE 42069/tcp
ENTRYPOINT [ "npm", "run", "start" ]