#!/bin/sh
set -e

echo "🔍 Checking migration counts..."
echo "--- public.schema_migrations ---"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT count(*) FROM public.schema_migrations;" || echo "Table not found"

echo "--- auth.schema_migrations ---"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT count(*) FROM auth.schema_migrations;" || echo "Table not found"
