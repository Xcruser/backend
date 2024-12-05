const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const projectsRouter = require('./routes/projects');
const blogRouter = require('./routes/blog');
const authRoutes = require('./routes/auth');

// Lade Umgebungsvariablen
require('dotenv').config();

// Initialisiere Express
const app = express();

// Verbinde mit MongoDB
connectDB();

// CORS Konfiguration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth'],
    credentials: true
}));

app.use(express.json());

// Session Middleware für die Authentifizierung
app.use((req, res, next) => {
    // Prüfe auf geschützte Routen
    if (req.path.startsWith('/api/blog') && req.method !== 'GET') {
        const authToken = req.headers['x-auth'];
        const isAuthenticated = authToken === process.env.AUTH_TOKEN;
        if (!isAuthenticated) {
            return res.status(401).json({ message: 'Nicht authentifiziert' });
        }
    }
    next();
});

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Etwas ist schief gelaufen!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
