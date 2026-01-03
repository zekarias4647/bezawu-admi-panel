// db.js
require('dotenv').config(); // Load environment variables
const { Pool } = require('pg');

// Create a new PostgreSQL pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 20, // optional: max number of clients in the pool
 
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Export the query method for executing queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
