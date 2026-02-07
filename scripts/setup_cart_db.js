
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Default Supabase local config
const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260207_cart_schema.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running cart migration...');
        await client.query(sql);
        console.log('Cart migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
