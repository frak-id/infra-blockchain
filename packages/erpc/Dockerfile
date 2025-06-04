# Config bundler step
FROM oven/bun:latest AS bundler

# Clean up and create directory with proper permissions
RUN rm -rf /tmp/dev || true && mkdir -p /tmp/dev

# Bundle everything in a single erpc.js file
COPY . /tmp/dev
RUN cd /tmp/dev && bun install --production
RUN cd /tmp/dev && bun build --outfile ./erpc.js --minify --target node --external "@erpc-cloud/config" src/index.ts

# Final image
#FROM erpc-dev AS final
FROM ghcr.io/erpc/erpc:0.0.50 AS final

# Copy the bundled config
COPY --from=bundler ./tmp/dev/erpc.js /root/erpc.js
