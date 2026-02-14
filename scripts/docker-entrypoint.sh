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
if [ -d "supabase/migrations" ]; then
  echo "🔄 Running database migrations..."
  
  # Loop through migration files sorted by name
  for file in $(ls supabase/migrations/*.sql | sort); do
    echo "Applying $file..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$file"
  done
  
  echo "✅ Migrations completed!"
else
  echo "⚠️  No migrations directory found at supabase/migrations"
fi

echo "✅ Starting Next.js application..."

# Execute the main command
exec "$@"
