FROM golang:1.23-alpine AS erpc-builder
RUN apk add --no-cache git

ARG ERPC_VERSION=0.0.46
RUN git clone https://github.com/erpc/erpc.git -b ${ERPC_VERSION} --depth 1 /erpc
WORKDIR /erpc

# Update the Sonic library so we can fix the support for ARM 64
RUN go get github.com/bytedance/sonic@v1.13.2 
RUN go mod download

# Build config
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=arm64

# Build the final binary
RUN LDFLAGS="-w -s -X common.ErpcVersion=${ERPC_VERSION} -X common.ErpcCommitSha=$(git rev-parse --short HEAD)"; \
    go build -v -ldflags="$LDFLAGS" -a -installsuffix cgo -o /build/erpc ./cmd/erpc/main.go

# Config bundler step
FROM oven/bun:latest AS bundler

# Clean up and create directory with proper permissions
RUN rm -rf /tmp/dev || true && mkdir -p /tmp/dev

# Bundle everything in a single erpc.js file
COPY . /tmp/dev
RUN cd /tmp/dev && bun install --production
RUN cd /tmp/dev && bun build --outfile ./erpc.js --minify --target node src/index.ts

# Final stage
FROM gcr.io/distroless/static-debian12:nonroot AS final

# Copy the erpc binay
COPY --from=erpc-builder /build/erpc /erpc
# Copy the bundled config
COPY --from=bundler ./tmp/dev/erpc.js /erpc.js

# Expose ports
EXPOSE 4000 4001 6060

ENTRYPOINT ["/erpc"]
CMD ["--config", "/erpc.js"]