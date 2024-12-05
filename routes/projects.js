const express = require('express');
const router = express.Router();
const axios = require('axios');

// GitHub API Endpunkt
const GITHUB_API = 'https://api.github.com';

// Funktion zum Abrufen und Formatieren der Projekte von GitHub
async function fetchProjects(username) {
    console.log('Fetching projects for GitHub username:', username);
    const githubToken = process.env.GITHUB_TOKEN;
    
    try {
        const url = `https://api.github.com/users/${username}/repos`;
        console.log('Fetching from GitHub URL:', url);
        
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${githubToken}`
            }
        });

        // Formatieren der Repository-Informationen als Projekte
        const projects = response.data.map(repo => ({
            id: repo.id,
            title: repo.name,
            description: repo.description || 'Keine Beschreibung verfügbar',
            image: '/images/project-placeholder.svg',  // Verwende direkt das SVG als Standard
            detailedDescription: repo.description || 'Keine detaillierte Beschreibung verfügbar',
            technologies: [repo.language].filter(Boolean),
            github: repo.html_url,
            demoUrl: repo.homepage || '#',
            status: repo.archived ? 'archived' : 'active',
            stars: repo.stargazers_count,
            lastUpdate: repo.updated_at,
            topics: repo.topics || []
        }));

        console.log('Formatted projects:', projects);
        return projects;
    } catch (error) {
        console.error('Fehler beim Abrufen der Projekte:', error.response?.data || error.message);
        throw error;
    }
}

// GET /api/projects
router.get('/', async (req, res) => {
    console.log('GET /api/projects request received');
    try {
        const username = process.env.GITHUB_USERNAME;
        if (!username) {
            throw new Error('GitHub Benutzername ist nicht konfiguriert');
        }
        const projects = await fetchProjects(username);
        console.log('Sending projects to client:', projects);
        res.json(projects);
    } catch (error) {
        console.error('Error in GET /api/projects:', error);
        res.status(500).json({ 
            message: 'Fehler beim Abrufen der Projekte',
            error: error.message 
        });
    }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
    console.log('GET /api/projects/:id request received, id:', req.params.id);
    try {
        const username = process.env.GITHUB_USERNAME;
        if (!username) {
            throw new Error('GitHub Benutzername ist nicht konfiguriert');
        }
        const projects = await fetchProjects(username);
        const project = projects.find(p => p.id === parseInt(req.params.id));
        
        if (!project) {
            console.log('Project not found for id:', req.params.id);
            return res.status(404).json({ message: 'Projekt nicht gefunden' });
        }
        
        console.log('Sending project to client:', project);
        res.json(project);
    } catch (error) {
        console.error('Error in GET /api/projects/:id:', error);
        res.status(500).json({ 
            message: 'Fehler beim Abrufen des Projekts',
            error: error.message 
        });
    }
});

module.exports = router;
