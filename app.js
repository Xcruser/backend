const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const projectsRouter = require('./routes/projects');
const blogRouter = require('./routes/blog');

// Lade Umgebungsvariablen
require('dotenv').config();

// Initialisiere Express
const app = express();

// Verbinde mit MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/blog', blogRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
