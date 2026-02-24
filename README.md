# FinSaarthi

[![Open App](https://img.shields.io/badge/Open%20App-FinSaarthi-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://finsaarthi-six.vercel.app/)

FinSaarthi is a scholarship management web application built with React + Vite. It provides student and admin experiences, local authentication state, and a lightweight Express server for serving the production build.

## Live Demo

- Production URL: [https://finsaarthi-six.vercel.app/](https://finsaarthi-six.vercel.app/)

## Table of Contents

- [Live Demo](#live-demo)
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Authentication and Data Model](#authentication-and-data-model)
- [Routes and Pages](#routes-and-pages)
- [Backend Server](#backend-server)
- [Deployment Notes](#deployment-notes)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

This project is designed to help students discover scholarships, manage profile data, and track applications, while admins can manage scholarship records and oversee platform data.

## Key Features

- Student dashboard for scholarship and profile workflows
- Admin panel for scholarship management
- Local authentication state using React Context + `localStorage`
- Scholarship listings with reusable card components
- Responsive UI built with Tailwind CSS
- Fast development/build workflow using Vite

## Tech Stack

### Frontend

- React 18
- React Router DOM
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend (Production Serving)

- Node.js
- Express

## Project Structure

```text
FinSaarthi/
├── src/
│   ├── component/
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   └── ScholarshipCard.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── pages/
│   │   ├── AdminPanel.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ScholarshipsPage.jsx
│   │   └── StudentDashboard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── server.js
├── tailwind.config.js
├── versel.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm (or yarn/pnpm)

### Installation

```bash
git clone https://github.com/shubhamanand020/Finsaarthi.git
cd Finsaarthi
npm install
```

## Available Scripts

Run these from the project root:

- `npm run dev` — Start the Vite development server
- `npm run build` — Build the production bundle into `dist/`
- `npm run preview` — Preview the production build locally
- `npm run start` — Run the Express server (`server.js`) to serve `dist/`

## Authentication and Data Model

### Authentication (`AuthContext`)

`AuthContext` manages:

- `user`
- `isLoading`
- `login(userData)`
- `logout()`

Auth state is persisted in `localStorage` under key: `finSaarthiUser`.

### Local Data (`useLocalStorage`)

`useLocalStorage` stores app data in `localStorage` under key: `finSaarthiData` and provides helpers for:

- User CRUD operations
- Scholarship CRUD operations
- Application create/status tracking

It also seeds initial demo users and scholarship records for local usage.

## Routes and Pages

The app uses `react-router-dom` with the following routes:

- `/` → HomePage
- `/login` → LoginPage
- `/register` → RegisterPage
- `/dashboard` → StudentDashboard
- `/admin` → AdminPanel
- `/scholarships` → ScholarshipsPage
- `/profile` → ProfilePage

Unknown routes are redirected to `/`.

## Backend Server

`server.js` is a minimal Express server intended for serving the built frontend:

- Serves static files from `dist/`
- Uses a catch-all route to return `dist/index.html` for client-side routing
- Runs on `process.env.PORT` or `3000`

Typical production flow:

```bash
npm run build
npm run start
```

## Deployment Notes

- Live deployment is available on Vercel: [https://finsaarthi-six.vercel.app/](https://finsaarthi-six.vercel.app/)
- Frontend can be deployed on platforms like Vercel/Netlify from the Vite build output.
- If using the Express server, deploy as a Node app and ensure `dist/` is generated before startup.

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push and open a pull request

Please follow the existing React + Tailwind code style.

## License

No license file is currently included. Add a license (for example, MIT) if you plan to open-source this project publicly.

## Contact

- Owner: [@shubhamanand020](https://github.com/shubhamanand020)
- Issues: Use the GitHub repository Issues tab