# Config bundler step
FROM oven/bun:latest AS bundler

# Clean up and create directory with proper permissions
RUN rm -rf /temp/dev || true && mkdir -p /temp/dev

# Bundle everything in a single erpc.js file
COPY . /temp/dev
RUN cd /temp/dev && bun install --production
RUN cd /temp/dev && bun build --outfile ./erpc.js --minify --target node --external "@erpc-cloud/*" src/index.ts

# Final image
#FROM erpc-dev AS final
FROM ghcr.io/erpc/erpc@sha256:0a03a85e2186463094904d4ee00baed0cad8a490f0640d6f78fb771d3ab83612 AS final

# Install curl, will be used for healthcheck
RUN apt-get update && apt-get install -y curl

# Copy the bundled config
COPY --from=bundler ./temp/dev/erpc.js /root/erpc.js

# Run the server
CMD ["./erpc-server"]