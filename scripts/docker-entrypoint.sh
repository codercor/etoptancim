#!/bin/sh
set -e

echo "🚀 Starting Docker entrypoint..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is up!"

# Run migrations if they exist
if [ -d "/app/supabase/migrations" ]; then
  echo "🔄 Running database migrations..."
  # Note: You'll need to implement migration runner
  # For now, migrations should be run manually or via Supabase CLI
  echo "⚠️  Migrations should be applied before first run"
fi

echo "✅ Starting Next.js application..."

# Execute the main command
exec "$@"
