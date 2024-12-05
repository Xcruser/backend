const express = require('express');
const router = express.Router();
require('dotenv').config();

// Einfache Authentifizierung
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Verwende Umgebungsvariablen für die Anmeldedaten
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
        return res.status(500).json({ 
            success: false, 
            message: 'Server-Konfigurationsfehler: Anmeldedaten nicht konfiguriert' 
        });
    }

    if (username === validUsername && password === validPassword) {
        // Erfolgreiche Anmeldung
        res.json({ success: true });
    } else {
        // Fehlgeschlagene Anmeldung
        res.status(401).json({ 
            success: false, 
            message: 'Ungültige Anmeldedaten' 
        });
    }
});

module.exports = router;
