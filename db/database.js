const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool WITHOUT specifying the database initially
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Don't specify database here initially
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database - create database and table if they don't exist
async function initializeDatabase() {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    console.log('Connected to MySQL server...');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);
    
    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME}\``);
    console.log(`Using database '${process.env.DB_NAME}'`);
    
    // Create items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Table "items" created or already exists');
    console.log('Database initialized successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Create a new pool that connects to the specific database after initialization
let dbPool;

async function createDatabasePool() {
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME, // Now we can specify the database
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('Database pool created successfully');
    return dbPool;
  } catch (error) {
    console.error('Error creating database pool:', error);
    throw error;
  }
}

// Initialize everything
async function setup() {
  await initializeDatabase();
  return await createDatabasePool();
}

// Export the setup function and a getter for the pool
module.exports = {
  setup,
  getPool: () => dbPool
};