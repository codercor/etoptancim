#!/bin/sh
set -e

echo "🔍 Checking database schemas..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\dn"

echo "🔍 Checking tables in 'auth' schema..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\dt auth.*"

echo "🔍 Checking tables in 'public' schema (just to be sure)..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\dt public.*"
