# Uni2Clup

A full-stack **University Club & Event Management Platform** developed as a university team project.

Uni2Clup digitalizes university club operations by bringing **club memberships, events, announcements, surveys, administrative workflows, and AI-powered recommendations** into a single platform.

The application was developed using **ASP.NET Core Web API, React, TypeScript, Microsoft SQL Server, Entity Framework Core, Docker, JWT authentication, and Ollama**.

---

## Overview

University clubs often manage memberships, events, announcements, and student engagement through disconnected systems.

**Uni2Clup** was designed to centralize these processes and provide different interfaces and capabilities for students, club managers, and administrators.

The project was developed by a **3-member team**.

My main responsibilities included:

- Project management
- Initial system architecture
- Backend development
- API development
- Database integration
- Authentication and authorization
- Docker environment management
- AI-powered recommendation system integration

---

## Key Features

### Student

Students can:

- Browse university clubs
- Join clubs
- View club information
- Discover upcoming events
- Participate in events
- View announcements
- Participate in surveys
- Manage their profile
- View previous event activity
- Receive personalized club recommendations

### Club Manager

Club managers can:

- Manage their club
- Create and manage events
- Publish announcements
- Manage club-related content
- Interact with club members
- Create and manage surveys

### Administrator

Administrators can:

- Manage users
- Manage roles
- Review club-related applications
- Control administrative workflows
- Manage platform-level operations

---

## AI-Powered Club Recommendation

Uni2Clup includes an **AI-powered recommendation module** designed to provide personalized club suggestions to students.

The recommendation system uses:

- **Ollama**
- **Qwen3:4B**
- Student interests
- Club and event preferences

Student preferences are analyzed by the locally running language model to generate personalized club recommendations.

This feature provided practical experience with integrating **local Large Language Models into a full-stack web application**.

---

## Tech Stack

### Backend

- C#
- ASP.NET Core
- ASP.NET Core Web API
- Entity Framework Core
- REST APIs
- JWT Authentication
- Role-Based Authorization
- Swagger / OpenAPI

### Frontend

- React
- TypeScript
- JavaScript
- REST API Integration

### Database

- Microsoft SQL Server
- Entity Framework Core

### AI

- Ollama
- Qwen3:4B
- Local LLM Integration

### DevOps & Tools

- Docker
- Docker Compose
- Git
- GitHub
- Visual Studio

---

## Architecture

Uni2Clup follows a full-stack architecture in which the React frontend communicates with the ASP.NET Core backend through REST APIs.

```text
┌─────────────────────┐
│   React Frontend    │
│ JavaScript / TS     │
└──────────┬──────────┘
           │
           │ REST API
           ▼
┌─────────────────────┐
│ ASP.NET Core Web API│
│                     │
│ Controllers         │
│ Services            │
│ Business Logic      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Entity Framework    │
│ Core                │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Microsoft SQL Server│
└─────────────────────┘

           +
           
┌─────────────────────┐
│ Ollama              │
│ Qwen3:4B            │
│ AI Recommendations  │
└─────────────────────┘
```

The architecture separates frontend, backend, database, and AI responsibilities to keep the application modular and maintainable.

---

## Authentication & Authorization

Authentication is implemented using **JSON Web Tokens (JWT)**.

The platform uses role-based authorization to provide different application capabilities for:

- Students
- Club Managers
- Administrators

Protected endpoints ensure that users can only access operations allowed by their assigned roles.

The authentication flow includes:

- User authentication
- JWT generation
- Protected API endpoints
- Role-based access control
- User status validation

---

## Database

The application uses **Microsoft SQL Server** with **Entity Framework Core**.

The database manages application entities such as:

- Users
- Clubs
- Club memberships
- Events
- Event participation
- Announcements
- Surveys
- Roles
- Student preferences

Entity Framework Core provides the data access layer between the application and SQL Server.

---

## REST API

The ASP.NET Core backend exposes REST APIs consumed by the React frontend.

The API layer handles operations related to:

- Authentication
- Users
- Clubs
- Memberships
- Events
- Announcements
- Surveys
- Administration
- AI recommendations

Swagger / OpenAPI support is used to inspect and test backend endpoints during development.

---

## Email Integration

The application includes email functionality for system-related communication.

SMTP-based email integration can be used for workflows such as:

- User notifications
- Account-related communication
- Application updates

---

## Surveys

Uni2Clup includes a survey system that allows clubs to collect feedback and interact with students.

The survey functionality enables:

- Survey creation
- Student participation
- Club-related feedback collection
- Engagement tracking

---

## Docker

The project uses **Docker and Docker Compose** to simplify development and service management.

The Docker environment includes application infrastructure such as:

- ASP.NET Core API
- Microsoft SQL Server

A typical Docker workflow is:

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

Environment-specific configuration such as database credentials should be configured before starting the containers.

---

## Getting Started

### Requirements

Make sure the following tools are available:

- .NET SDK
- Node.js
- npm
- Microsoft SQL Server or Docker
- Docker Desktop
- Ollama
- Git

---

## Clone the Repository

```bash
git clone https://github.com/alperrte/Uni2Clup-Project-.git
cd Uni2Clup-Project-
```

---

## Backend

Navigate to the ASP.NET Core project directory.

Restore dependencies:

```bash
dotnet restore
```

Build the application:

```bash
dotnet build
```

Run the backend:

```bash
dotnet run
```

The Swagger interface can be used during development to inspect available API endpoints.

---

## Frontend

Navigate to the frontend directory.

Install dependencies:

```bash
npm install
```

Start the frontend development environment:

```bash
npm start
```

or, depending on the frontend configuration:

```bash
npm run dev
```

The frontend communicates with the ASP.NET Core backend through REST APIs.

---

## Running the AI Recommendation System

The AI recommendation feature requires **Ollama**.

After Ollama is installed, make sure the required model is available:

```bash
ollama pull qwen3:4b
```

Start Ollama and ensure the application can communicate with the local Ollama service.

The recommendation module uses student interests and preferences as context for generating personalized club suggestions.

---

## Project Structure

A simplified representation of the project architecture:

```text
Uni2Clup
│
├── Backend
│   ├── Controllers
│   ├── Services
│   ├── Models
│   ├── Data
│   ├── Middleware
│   └── Program.cs
│
├── uni2clup-frontend
│   └── src
│       ├── components
│       ├── pages
│       └── services
│
├── Docker
│
└── docker-compose.yml
```

The exact directory structure may vary as the project evolves.

---

## What I Worked On

My contributions to the project included:

- Project planning and management
- Initial software architecture
- ASP.NET Core backend development
- REST API implementation
- Microsoft SQL Server integration
- Entity Framework Core
- JWT authentication
- Role-based authorization
- Docker and Docker Compose management
- Backend/frontend integration
- AI recommendation system development
- Ollama and Qwen3 integration

---

## What I Practiced

During the development of Uni2Clup, I gained hands-on experience with:

- Full-stack application development
- REST API design
- ASP.NET Core
- C# backend development
- Authentication and authorization
- Relational database design
- Entity Framework Core
- React and TypeScript
- Docker containerization
- Team-based software development
- Local LLM integration
- AI-powered recommendation systems

---

## Team Project

Uni2Clup was developed as a **3-member university team project**.

The project provided experience not only in software development but also in:

- Team collaboration
- Project planning
- Task distribution
- Git/GitHub workflows
- Architecture decisions
- Integrating independently developed modules

---

## Screenshots

Application screenshots can be added under a structure such as:

```text
docs/
└── screenshots/
    ├── login.png
    ├── student-dashboard.png
    ├── club-page.png
    ├── event-page.png
    ├── admin-panel.png
    └── ai-recommendations.png
```

Example:

```markdown
![Student Dashboard](docs/screenshots/student-dashboard.png)

![AI Club Recommendations](docs/screenshots/ai-recommendations.png)
```

---

## Author

**Alper Temiz**

Software Engineering Student  
Backend & Full-Stack Development

- GitHub: https://github.com/alperrte
- LinkedIn: https://www.linkedin.com/in/alpertemizz/

---

## Repository

https://github.com/alperrte/Uni2Clup-Project-
