# nats/Dockerfile

FROM nats:2.7-alpine

# Copy the configuration file
COPY nats-server.conf /etc/nats/nats-server.conf

# Expose the NATS port
EXPOSE 4222

# Start NATS with the configuration file
CMD ["nats-server", "-c", "/etc/nats/nats-server.conf"]
