
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const { config } = require('dotenv');
// Initialize Express app
const app = express();
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://thesuperchatbot.vercel.app/' // Replace with your frontend's domain on Render
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow cookies/sessions
}));
// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable for security
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/authapp',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,              // Prevent client-side JavaScript access
    secure: process.env.NODE_ENV === 'production', // Enable Secure flag in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-origin cookies in production
  }
}));

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

