import type { RequestHandler } from '@sveltejs/kit';
import { Client } from 'pg';

// DB connection config (use environment variables for real apps)
const client = new Client({
  user: 'jeff',
  password: 'Ac967Q',
  host: 'localhost',
  port: 5432,
  database: 'jeff'
});

export const GET: RequestHandler = async () => {
  // Database code is present, but we're not connecting for now.
  await client.connect();
  const res = await client.query('SELECT NOW()');
  await client.end();

  // Simulate data as if it was fetched from the DB
  //const simulatedNow = new Date().toISOString();

  return new Response(
    JSON.stringify({ message: `The (simulated) time is ${res}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
