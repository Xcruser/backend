const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// CORS-Konfiguration
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Globale Header-Middleware
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// GitHub Routes
const githubRoutes = require('./routes/github');
const projectRoutes = require('./routes/projects');

app.use('/api/github', githubRoutes);
app.use('/api/projects', projectRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.listen(port, () => {
  console.log(`Backend service listening at http://localhost:${port}`);
});
