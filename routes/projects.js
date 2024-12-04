const express = require('express');
const router = express.Router();

// Beispiel-Projektdaten (später durch Datenbankabfrage ersetzen)
const projects = [
    {
        id: 1,
        title: 'Home Server Setup',
        description: 'Komplette Anleitung zur Einrichtung eines Home Servers mit Docker',
        image: '/project1.jpg',
        detailedDescription: 'Eine ausführliche Dokumentation und Anleitung zur Einrichtung eines Home Servers mit Docker. Inklusive Beispiele für verschiedene Services und Best Practices für Sicherheit und Wartung.',
        technologies: ['Docker', 'Linux', 'Networking'],
        github: 'https://github.com/yourusername/homeserver-setup',
        demoUrl: '#',
        status: 'active'
    },
    {
        id: 2,
        title: 'Automatisierung',
        description: 'Praktische Skripte und Tools für die Server-Automatisierung',
        image: '/project2.jpg',
        detailedDescription: 'Eine Sammlung von Automatisierungsskripten und Tools für verschiedene Server-Aufgaben. Von Backup-Automatisierung bis hin zu Monitoring-Lösungen.',
        technologies: ['Python', 'Bash', 'Ansible'],
        github: 'https://github.com/yourusername/server-automation',
        demoUrl: '#',
        status: 'active'
    },
    {
        id: 3,
        title: 'Monitoring & Backup',
        description: 'Lösungen für Server-Überwachung und Datensicherung',
        image: '/project3.jpg',
        detailedDescription: 'Ein komplettes System zur Überwachung von Servern und automatischer Datensicherung. Includes Grafana Dashboards und Backup-Strategien.',
        technologies: ['Grafana', 'Prometheus', 'Backup Solutions'],
        github: 'https://github.com/yourusername/monitoring-backup',
        demoUrl: '#',
        status: 'active'
    }
];

// GET /api/projects
router.get('/', (req, res) => {
    res.json(projects);
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
});

module.exports = router;
