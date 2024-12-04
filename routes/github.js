const express = require('express');
const router = express.Router();
const axios = require('axios');

// GitHub API Endpunkt
const GITHUB_API = 'https://api.github.com';

router.get('/repositories', async (req, res) => {
    try {
        // GitHub Username aus der Umgebungsvariable
        const username = process.env.GITHUB_USERNAME;
        
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'GitHub Benutzername ist nicht konfiguriert',
                status: 400
            });
        }

        // Abrufen der Repository-Daten von GitHub
        const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'node.js'
            }
        });

        // Formatieren der Repository-Informationen
        const repositories = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            website: repo.homepage || repo.html_url,
            description: repo.description || 'Keine Beschreibung verfügbar',
            stars: repo.stargazers_count,
            language: repo.language,
            lastUpdate: repo.updated_at,
            url: repo.html_url,
            topics: repo.topics || []
        }));

        // Erfolgreiche Antwort
        res.status(200).json({
            success: true,
            data: repositories,
            status: 200
        });

    } catch (error) {
        console.error('Fehler beim Abrufen der GitHub Repositories:', error);
        
        // Fehlerantwort
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Fehler beim Abrufen der GitHub Repositories',
            message: error.message,
            status: error.response?.status || 500
        });
    }
});

module.exports = router;
