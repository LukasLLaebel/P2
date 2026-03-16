import type { RequestHandler } from '@sveltejs/kit';
import { Client } from 'pg';

// DB connection config (use environment variables for real apps)
const client = new Client({
  user: 'postgres',
  password: 'yourpassword',
  host: 'localhost',
  port: 5432,
  database: 'mydb'
});

export const GET: RequestHandler = async () => {
  await client.connect();
  const res = await client.query('SELECT NOW()');
  await client.end();

  return new Response(JSON.stringify({ message: `The time is ${res.rows[0].now}` }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
