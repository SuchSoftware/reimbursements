#!/bin/bash

# Modified from:
# https://hub.docker.com/_/postgres/
set -e

echo $POSTGRES_USER
echo $POSTGRES_DB

psql -v ON_ERROR_STOP=1 -v VERBOSITY=verbose --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE reimbursements_test;
  \c reimbursements_test

  GRANT ALL PRIVILEGES ON DATABASE reimbursements_test TO reimbursements;
  ALTER DEFAULT PRIVILEGES FOR ROLE reimbursements IN SCHEMA PUBLIC GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO reimbursements;
  ALTER DEFAULT PRIVILEGES FOR ROLE reimbursements IN SCHEMA PUBLIC GRANT EXECUTE ON FUNCTIONS TO reimbursements;
EOSQL
