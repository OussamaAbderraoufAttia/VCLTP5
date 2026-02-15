# Use the official PostgreSQL 13 image as base
FROM postgres:13

# The init.sql script can be copied into the entrypoint directory
# so it runs automatically when the container is started for the first time.
COPY init.sql /docker-entrypoint-initdb.d/
