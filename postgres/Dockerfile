# Use the official PostgreSQL image
FROM postgres:16-alpine

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=test
ENV POSTGRES_PASSWORD=test
ENV POSTGRES_DB=lichess_stream

# Copy initialization scripts
COPY resources/init/ /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432
