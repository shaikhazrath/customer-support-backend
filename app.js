const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const { config } = require('dotenv');

// Initialize Express app
const app = express();

config({ path: './.env' });


app.use(cors({
  origin: "*", // Allows all origins
}));


// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;