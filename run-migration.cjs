const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();
async function runMigration() {
    const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });

    const migrationDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationDir).sort();

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const migrationFile of migrationFiles) {
            const migrationPath = path.join(migrationDir, migrationFile);
            const migrationScript = fs.readFileSync(migrationPath, 'utf8');

            try {
                await client.query(migrationScript);
            } catch (error) {
                console.error(`Error applying migration ${migrationFile}: ${error}`);
                await client.query('ROLLBACK');
                throw error;
            }
        }

        await client.query('COMMIT');
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
