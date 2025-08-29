#!/bin/bash
# this script is used to initialize the database in the docker container
set -e # Exit on error
set -x # Print commands
set -u # Treat unset variables as an error

if [ -n "${DB_USERNAME:-}" ] && [ -n "${DB_PASSWORD:-}" ]; then
    psql -v ON_ERROR_STOP=1 --username "$DB_USERNAME" <<-EOSQL
		CREATE DATABASE ${DB_DATABASE};
		GRANT ALL PRIVILEGES ON DATABASE ${DB_DATABASE} TO ${DB_USERNAME};
	EOSQL
else
    echo "SETUP INFO: No Environment variables given!"
fi
