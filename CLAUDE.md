# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PwnDoc is a pentest reporting application with AI-powered translation capabilities. The main goal is to reduce documentation time for security audits by providing collaborative tools and AI assistance.

### Key Features
- Multi-user collaborative pentest reporting
- Vulnerability database with reusable findings
- Customizable Docx report templates
- AI-powered translation (Chinese to English)
- AI-assisted vulnerability field completion
- Docker-based deployment

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│                 │    │                 │    │                 │
│  Vue.js         │◄──►│  Node.js        │◄──►│  MongoDB        │
│  Quasar         │    │  Express.js     │    │                 │
│  Nginx (Docker) │    │  JWT Auth       │    │  GridFS         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Services   │
                    │                 │
                    │  OpenAI API     │
                    │  Azure OpenAI   │
                    │  Local Ollama   │
                    └─────────────────┘
```

### Technology Stack
- **Frontend**: Vue.js 2, Quasar Framework, Axios
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB with GridFS for file storage
- **Authentication**: JWT tokens with role-based access
- **AI Integration**: OpenAI, Azure OpenAI, Ollama support
- **Deployment**: Docker, docker-compose, Nginx

## Repository Information

- **GitHub URL**: https://github.com/naecoyes/pwndoc-1.3.2-autoTranslate
- **Main Branch**: main

## Common Development Tasks

### Running the Application

#### Docker Deployment (Recommended)
```bash
# Start with the automated script
chmod +x docker-start.sh
./docker-start.sh

# Or manually with docker-compose
docker-compose up --build -d
```

#### Manual Development Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Run specific test
npm test -- -t "test name"
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## AI Translation Feature

The AI translation feature is a core enhancement that allows one-click translation of Chinese security audit reports to English while preserving HTML formatting and technical terminology.

### Key Components
1. **Backend Service**: `backend/src/lib/ai-service.js` - Handles AI API calls and content translation
2. **API Routes**: `backend/src/routes/ai.js` - Exposes translation endpoints
3. **Frontend Integration**: `frontend/src/pages/audits/list/audits-list.js` - UI for translation feature
4. **Frontend Service**: `frontend/src/services/ai.js` - Client-side AI service calls

### Supported AI Providers
- OpenAI (GPT models)
- Azure OpenAI
- Local Ollama models
- ModelScope
- DeepSeek
- Anthropic Claude
- Groq
- Together AI

## Code Structure

### Backend (`backend/`)
- `src/app.js` - Main application entry point
- `src/lib/` - Core libraries and services
- `src/models/` - MongoDB data models
- `src/routes/` - API route definitions
- `src/translate/` - UI translation files

### Frontend (`frontend/`)
- `src/pages/` - Main page components
- `src/components/` - Reusable UI components
- `src/services/` - API service clients
- `src/boot/` - Application boot files

## Key Files to Understand

1. `backend/src/lib/ai-service.js` - Core AI translation logic
2. `backend/src/routes/ai.js` - AI API endpoints
3. `frontend/src/pages/audits/list/audits-list.js` - Translation UI implementation
4. `frontend/src/services/ai.js` - Frontend AI service client
5. `docker-compose.yml` - Main deployment configuration

## Demo and Visual Assets

The repository includes several demo files and visual assets to showcase the application's features:

### Demo Videos and GIFs
- `demos/Pwndoc-auto.mov` - Main demonstration video of the AI translation feature
- `demos/audit_finding_demo.gif` - Animated demonstration of finding editing
- `demos/create_and_update_finding.gif` - Animated demonstration of vulnerability management workflow
- `demos/shared_audit_demo.gif` - Animated demonstration of multi-user reporting
- `demos/51 PM (2).png` - Screenshot of the application interface

### Screenshots
- `Screenshot 2025-09-28 at 2.39.48 PM.png` - Additional application screenshot

These visual assets are referenced in the README.md and provide users with a visual understanding of the application's capabilities.

## Development Notes

- The application uses a three-tier architecture with clear separation between frontend, backend, and database
- AI features require proper API key configuration in the Settings panel
- Translation preserves HTML tags and formatting while converting text content
- New audits are created for translations rather than modifying original content

## Common Commands

### Backend Development
```bash
# Start backend in development mode
cd backend
npm run dev

# Run backend tests
npm test

# Generate API documentation
npm run generate-api-doc
```

### Frontend Development
```bash
# Start frontend in development mode
cd frontend
npm run dev

# Build frontend for production
npm run build
```

### Docker Operations
```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Testing

### Backend Testing
The backend uses Jest for testing. Tests are located in the `backend/tests/` directory.

```bash
# Run all tests
cd backend
npm test

# Run specific test file
npm test -- tests/audit.test.js

# Run tests with specific pattern
npm test -- -t "audit creation"
```

## Debugging

### Backend Debugging
The backend can be started in debug mode using:
```bash
cd backend
npm run dev
```

### Frontend Debugging
The frontend can be started in development mode with hot-reload:
```bash
cd frontend
npm run dev
```

## API Documentation

The API documentation is available through Swagger when the backend is running:
- http://localhost:4242/api-docs

## Environment Variables

### Backend (.env file in backend directory)
- `DB_SERVER` - MongoDB server address
- `DB_NAME` - Database name
- `NODE_ENV` - Environment (development/production/test)

### Frontend (.env file in frontend directory)
- `APP_PORT` - Application port for frontend