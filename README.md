# HireFlow Frontend

React + Vite frontend for HireFlow — an AI-assisted recruitment platform supporting applicants and recruiters.

## Tech Stack

- **React 19** + **Vite 8** (HMR, fast builds)
- **React Router 7** for routing
- **Redux Toolkit** + **react-redux** for state management
- **Tailwind CSS 4** for styling
- **TipTap** for rich-text editing
- **@microsoft/fetch-event-source** for SSE notifications
- **pdfjs-dist** for resume preview
- **react-toastify** for notifications

## Prerequisites

- Node.js 22+ (matches the Docker image)
- npm 10+
- Docker (optional, for containerized runs)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/bakare-dev/hireflow.git
cd hireflow-frontend
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://api.stbrigitta.com/api/v1
VITE_NOTIFICATION_BASE_URL=https://notification.stbrigitta.com
```

Point these at your backend / notification service. Both are required.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR     |
| `npm run build`   | Production build into `dist/`      |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Run ESLint across the project      |

## Running with Docker

The included `Dockerfile` builds the app and serves the static output via nginx.

### Build the image

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.stbrigitta.com/api/v1 \
  --build-arg VITE_NOTIFICATION_BASE_URL=https://notification.stbrigitta.com \
  -t hireflow-frontend .
```

> Vite inlines env vars at build time, so they must be passed as `--build-arg` (not runtime `-e`).

### Run the container

```bash
docker run -p 8080:80 hireflow-frontend
```

The app will be available at `http://localhost:8080`.

## Project Structure

```
hireflow-frontend/
├── Dockerfile              # Multi-stage build: node build → nginx serve
├── nginx.conf              # SPA-friendly nginx config
├── vite.config.js          # Vite + Tailwind plugin config
├── eslint.config.js        # ESLint flat config
├── index.html              # Vite entry HTML
├── public/                 # Static assets served as-is
└── src/
    ├── main.jsx            # App bootstrap (Redux Provider, Router)
    ├── App.jsx             # Root component
    ├── index.css           # Tailwind directives + globals
    │
    ├── api/                # Backend API clients (one file per domain)
    │   ├── baseApi.js          # Shared fetch wrapper, auth headers
    │   ├── authApi.js          # Login / signup / token refresh
    │   ├── usersApi.js
    │   ├── companiesApi.js
    │   ├── jobsApi.js
    │   ├── applicationsApi.js
    │   ├── interviewsApi.js
    │   ├── scorecardsApi.js
    │   ├── resumeApi.js
    │   ├── adminApi.js
    │
    ├── services/           # Cross-cutting services (SSE, etc.)
    │
    ├── store/              # Redux Toolkit store
    │   ├── index.js            # Store configuration
    │   └── slices/             # Feature slices (auth, user, etc.)
    │
    ├── routes/             # Route definitions
    │   ├── index.jsx           # Route tree
    │   └── RoleGuard.jsx       # Role-based access control wrapper
    │
    ├── pages/              # Top-level route views
    │   ├── auth/               # Login, signup, reset password
    │   ├── applicant/          # Applicant-facing pages
    │   ├── recruitment/        # Recruiter-facing pages
    │   └── shared/             # Pages used by multiple roles
    │
    ├── components/         # Reusable UI
    │   ├── common/             # Buttons, inputs, modals, etc.
    │   ├── domain/             # Domain-specific composite components
    │   └── editor/             # TipTap editor pieces
    │
    ├── layout/             # App shells (sidebars, headers)
    ├── hooks/              # Custom React hooks
    ├── constants/          # Enums, route paths, copy
    ├── data/               # Static lookup data
    ├── utils/              # Pure helpers
    └── assets/             # Images, icons, fonts
```

## Environment Variables

| Variable                     | Required | Description                               |
| ---------------------------- | -------- | ----------------------------------------- |
| `VITE_API_BASE_URL`          | Yes      | Base URL for the HireFlow REST API        |
| `VITE_NOTIFICATION_BASE_URL` | Yes      | Base URL for the SSE notification service |

All variables must be prefixed with `VITE_` to be exposed to the client by Vite.
