const express = require('express');
const router = express.Router();
const axios = require('axios');

// GitHub API Endpunkt
const GITHUB_API = 'https://api.github.com';

// Cache für Repository-Daten
let repositoryCache = {
    data: null,
    lastUpdate: null
};

// Konfiguration basierend auf Token-Verfügbarkeit
function getConfig() {
    const hasToken = !!process.env.GITHUB_TOKEN;
    return {
        // Mit Token: 5 Minuten Cache, 15 Minuten Update-Intervall
        // Ohne Token: 1 Stunde Cache, 1 Stunde Update-Intervall
        CACHE_DURATION: hasToken ? 5 * 60 * 1000 : 60 * 60 * 1000,
        UPDATE_INTERVAL: hasToken ? 15 * 60 * 1000 : 60 * 60 * 1000,
        // Rate Limits: Mit Token 5000/Stunde, ohne Token 60/Stunde
        RATE_LIMIT: hasToken ? 5000 : 60,
        RATE_LIMIT_INTERVAL: 60 * 60 * 1000 // 1 Stunde
    };
}

// API Request Counter für Rate Limiting
let apiRequestCount = {
    count: 0,
    resetTime: Date.now() + getConfig().RATE_LIMIT_INTERVAL
};

// Funktion zum Prüfen und Aktualisieren des Rate Limits
function checkRateLimit() {
    const now = Date.now();
    if (now > apiRequestCount.resetTime) {
        apiRequestCount = {
            count: 0,
            resetTime: now + getConfig().RATE_LIMIT_INTERVAL
        };
    }
    
    if (apiRequestCount.count >= getConfig().RATE_LIMIT) {
        throw new Error('API Rate Limit erreicht. Bitte warten Sie bis zur nächsten Stunde.');
    }
    
    apiRequestCount.count++;
}

// Funktion zum Erstellen der Request-Header
function getHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'node.js'
    };

    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    return headers;
}

// Funktion zum Abrufen der Sprachen eines Repositories
async function fetchRepositoryLanguages(username, repoName) {
    try {
        checkRateLimit();
        const response = await axios.get(`${GITHUB_API}/repos/${username}/${repoName}/languages`, {
            headers: getHeaders()
        });
        return response.data;
    } catch (error) {
        console.error(`Fehler beim Abrufen der Sprachen für ${repoName}:`, error);
        return {};
    }
}

// Funktion zum Abrufen der package.json eines Repositories
async function fetchPackageJson(username, repoName) {
    try {
        checkRateLimit();
        const response = await axios.get(`${GITHUB_API}/repos/${username}/${repoName}/contents/package.json`, {
            headers: getHeaders()
        });
        
        const content = Buffer.from(response.data.content, 'base64').toString();
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

// Hauptfunktion zum Abrufen der Repository-Daten
async function fetchRepositories() {
    try {
        const username = process.env.GITHUB_USERNAME;
        
        if (!username) {
            throw new Error('GitHub Benutzername ist nicht konfiguriert');
        }

        checkRateLimit();
        const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
            headers: getHeaders()
        });

        // Repositories mit zusätzlichen Informationen anreichern
        const repositories = await Promise.all(response.data.map(async repo => {
            // Sprachen abrufen
            const languages = await fetchRepositoryLanguages(username, repo.name);
            
            // package.json abrufen (falls vorhanden)
            const packageJson = await fetchPackageJson(username, repo.name);
            
            // Technologien aus verschiedenen Quellen zusammenführen
            const technologies = {
                // Programmiersprachen aus GitHub
                languages: Object.keys(languages),
                // Abhängigkeiten aus package.json (falls vorhanden)
                dependencies: packageJson ? Object.keys({
                    ...packageJson.dependencies || {},
                    ...packageJson.devDependencies || {}
                }) : [],
                // Topics aus GitHub
                topics: repo.topics || []
            };

            return {
                id: repo.id,
                name: repo.name,
                website: repo.homepage || repo.html_url,
                description: repo.description || 'Keine Beschreibung verfügbar',
                stars: repo.stargazers_count,
                language: repo.language,
                lastUpdate: repo.updated_at,
                url: repo.html_url,
                topics: repo.topics || [],
                technologies: technologies,
                // Detaillierte Sprachenstatistik
                languageStats: languages
            };
        }));

        // Cache aktualisieren
        repositoryCache = {
            data: repositories,
            lastUpdate: new Date()
        };

        const config = getConfig();
        console.log(`[${new Date().toISOString()}] GitHub Repositories aktualisiert (${config.CACHE_DURATION / 60000} Minuten Cache)`);
        return repositories;
    } catch (error) {
        console.error('Fehler beim Abrufen der GitHub Repositories:', error);
        throw error;
    }
}

// Initialer Abruf der Repositories beim Serverstart
fetchRepositories().catch(error => {
    console.error('Initialer Repository-Abruf fehlgeschlagen:', error);
});

// Regelmäßige Aktualisierung einrichten
const config = getConfig();
setInterval(() => {
    fetchRepositories().catch(error => {
        console.error('Automatische Repository-Aktualisierung fehlgeschlagen:', error);
    });
}, config.UPDATE_INTERVAL);

// API-Endpunkt
router.get('/repositories', async (req, res) => {
    try {
        const config = getConfig();
        // Prüfen, ob Cache gültig ist
        const now = new Date();
        const cacheAge = repositoryCache.lastUpdate 
            ? now - repositoryCache.lastUpdate 
            : Infinity;

        // Wenn Cache abgelaufen oder nicht vorhanden, neue Daten abrufen
        if (!repositoryCache.data || cacheAge > config.CACHE_DURATION) {
            await fetchRepositories();
        }

        // Cache-Status in Response-Header einfügen
        res.set({
            'X-Cache-Age': Math.floor(cacheAge / 1000) + 's',
            'X-Next-Update': Math.floor((config.UPDATE_INTERVAL - (now - repositoryCache.lastUpdate)) / 1000) + 's',
            'X-Rate-Limit': getConfig().RATE_LIMIT,
            'X-Rate-Limit-Used': apiRequestCount.count,
            'X-Rate-Limit-Reset': Math.floor((apiRequestCount.resetTime - now) / 1000) + 's'
        });

        // Gecachte Daten zurückgeben
        res.status(200).json({
            success: true,
            data: repositoryCache.data,
            status: 200,
            cached: true,
            lastUpdate: repositoryCache.lastUpdate,
            rateLimit: {
                limit: config.RATE_LIMIT,
                used: apiRequestCount.count,
                reset: apiRequestCount.resetTime
            }
        });

    } catch (error) {
        console.error('Fehler beim Verarbeiten der Repository-Anfrage:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Fehler beim Abrufen der GitHub Repositories',
            message: error.message,
            status: error.response?.status || 500
        });
    }
});

module.exports = router;
