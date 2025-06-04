const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database setup
const { setup: setupDatabase } = require('./db/database');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serves the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    // Setup database first
    console.log('Setting up database...');
    await setupDatabase();
    
    // Import and use routes after database is ready
    const itemRoutes = require('./routes/items');
    app.use('/api/items', itemRoutes);
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();