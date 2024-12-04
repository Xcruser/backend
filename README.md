# Backend Service

<div align="center">

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/Xcruser/backend)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

</div>

---

Ein moderner Express.js-basierter Backend-Service, der als API-Server für die Portfolio-Website dient.

## ⚡ Schnellstart

```bash
# Repository klonen
git clone https://github.com/Xcruser/backend.git

# Ins Verzeichnis wechseln
cd backend

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeite .env mit deinen Einstellungen

# Server starten
npm start
```

## 📚 API-Dokumentation

Der Service bietet folgende Hauptendpunkte:

### 🔄 GitHub Integration

`GET /api/github/repositories`
- Ruft alle GitHub-Repositories des konfigurierten Benutzers ab
- Benötigt `GITHUB_USERNAME` in `.env`
- Liefert detaillierte Repository-Informationen

### 📂 Projekte

`GET /api/projects`
- Ruft alle Projektinformationen ab
- Enthält Details zu persönlichen und Open-Source-Projekten
- Inkludiert Links, Technologien und Beschreibungen

## 🛠️ Technologie-Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.18.2
- **HTTP-Client**: Axios
- **Sicherheit**: CORS, Helmet
- **Konfiguration**: dotenv
- **Container**: Docker

## 🔒 Umgebungsvariablen

| Variable | Beschreibung | Standard |
|----------|-------------|-----------|
| `PORT` | Server Port | 3001 |
| `GITHUB_USERNAME` | GitHub Benutzername | - |

## 🚀 Deployment

### Docker

```bash
# Image bauen
docker build -t portfolio-backend .

# Container starten
docker run -p 3001:3001 portfolio-backend
```

### Standard

```bash
# Produktionsstart
npm start

# Der Server läuft auf:
http://localhost:3001
```

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.
