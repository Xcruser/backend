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
# Füge deine GitHub-Konfiguration in .env ein:
# GITHUB_USERNAME=dein_username
# GITHUB_TOKEN=dein_token

# Server starten
npm start
```

## 📚 API-Dokumentation

### 🔄 GitHub Integration (`/api/github/repositories`)

Der Endpunkt bietet eine flexible Integration mit GitHub, die sowohl mit als auch ohne Token funktioniert:

#### Authentifizierung

Die API unterstützt zwei Betriebsmodi:

1. **Mit GitHub Token** (empfohlen):
   - Rate Limit: 5000 Requests/Stunde
   - Cache-Dauer: 5 Minuten
   - Update-Intervall: 15 Minuten
   - Zugriff auf private Repositories

2. **Ohne Token** (Basic Access):
   - Rate Limit: 60 Requests/Stunde
   - Cache-Dauer: 60 Minuten
   - Update-Intervall: 60 Minuten
   - Nur öffentliche Repositories

Die API erkennt automatisch, ob ein Token konfiguriert ist und passt die Einstellungen entsprechend an.

#### Response Format

```json
{
    "success": true,
    "data": [
        {
            "id": "repo_id",
            "name": "repo_name",
            "description": "Beschreibung",
            "technologies": {
                "languages": ["JavaScript", "TypeScript"],
                "dependencies": ["express", "react"],
                "topics": ["api", "backend"]
            },
            "languageStats": {
                "JavaScript": 1500,
                "TypeScript": 800
            }
        }
    ],
    "cached": true,
    "lastUpdate": "2024-12-04T19:30:47Z",
    "rateLimit": {
        "limit": 5000,
        "used": 10,
        "reset": "2024-12-04T20:30:47Z"
    }
}
```

#### Response Header

Die API liefert nützliche Informationen in den Response-Headern:

- `X-Cache-Age`: Alter des Caches in Sekunden
- `X-Next-Update`: Zeit bis zur nächsten Aktualisierung
- `X-Rate-Limit`: Aktuelles Rate-Limit (5000 oder 60)
- `X-Rate-Limit-Used`: Anzahl der verwendeten Requests
- `X-Rate-Limit-Reset`: Zeit bis zum Reset des Rate-Limits

### 📂 Projekte (`/api/projects`)

Ruft alle Projektinformationen ab:
- Details zu persönlichen und Open-Source-Projekten
- Links und Technologie-Stack
- Projektbeschreibungen

## 🛠️ Technologie-Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.18.2
- **HTTP-Client**: Axios für GitHub API
- **Sicherheit**: CORS, Helmet
- **Caching**: In-Memory Cache
- **Container**: Docker

## 🔒 Umgebungsvariablen

| Variable | Beschreibung | Erforderlich |
|----------|-------------|--------------|
| `PORT` | Server Port | Optional (Standard: 3001) |
| `GITHUB_USERNAME` | GitHub Benutzername | Ja |
| `GITHUB_TOKEN` | GitHub Personal Access Token | Optional (empfohlen) |

### GitHub Token Einrichtung (Optional)

1. Gehe zu GitHub.com -> Settings -> Developer settings
2. Personal access tokens -> Tokens (classic)
3. Generate new token (classic)
4. Benötigte Berechtigungen:
   - `repo` (Lesezugriff auf Repositories)
   - `read:user` (Profilinformationen)

**Hinweis**: Ohne Token ist die API auf 60 Requests pro Stunde limitiert und kann nur öffentliche Repositories abrufen.

## 🚀 Deployment

### Docker

```bash
# Image bauen
docker build -t portfolio-backend .

# Container starten
docker run -p 3001:3001 \
  -e GITHUB_USERNAME=dein_username \
  -e GITHUB_TOKEN=dein_token \
  portfolio-backend
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
