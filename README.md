Finsaarthi

A React + JavaScript + Vite web application for managing scholarships, student dashboards, admin panels, and user authentication.
The project uses Tailwind CSS, Context API for Auth, and a clean component/page-based architecture.

📑 Table of Contents

About

Features

Tech Stack

Project Structure

Requirements

Installation

Running the App

Build

Authentication

Available Pages

Components

Context & Hooks

Styling

Backend (server.js)

Contributing

License

Contact

📘 About

Finsaarthi is a web platform that helps students browse scholarships, manage their profiles, and interact with an admin dashboard.
Built using modern React, Vite, and Tailwind, it focuses on simplicity, speed, and clean code.

✨ Features

🔐 Authentication using Context API

🎓 Student dashboard

🎁 Scholarship listing + individual cards

🧑‍💼 Admin panel

📄 Profile management

⚡ Fast builds using Vite

🎨 Tailwind CSS styling

📦 Modular component-based architecture

🛠 Tech Stack
Frontend

React (JavaScript)

Vite

React Router

Context API

Tailwind CSS

Backend (simple mock)

Node.js

Express (server.js present)

📁 Project Structure
Finsaarthi/
├── src/
│   ├── component/
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   └── ScholarshipCard.jsx
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useLocalStorage.js
│   │
│   ├── pages/
│   │   ├── AdminPanel.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ScholarshipsPage.jsx
│   │   └── StudentDashboard.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── server.js
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── index.html
├── package.json
└── README.md

📦 Requirements

Node.js 16+

npm or yarn

Git

Optional:

Express backend (server.js)

Docker

⬇️ Installation
git clone https://github.com/shubhamanand020/Finsaarthi.git
cd Finsaarthi

npm install

🚀 Run the App (Development)

Start Vite dev server:

npm run dev


The app runs at:

[https://finsaarthi-six.vercel.app/]

🏗 Build for Production
npm run build


Preview the production build:

npm run preview

🔐 Authentication (AuthContext)

Authentication is fully frontend using:

AuthContext.jsx

LocalStorage persistence

useLocalStorage() custom hook

AuthContext provides:

user

login()

logout()

register()

📄 Available Pages
Page	File	Description
Home	HomePage.jsx	Landing page
Login	LoginPage.jsx	Auth login
Register	RegisterPage.jsx	New user signup
Profile	ProfilePage.jsx	User info & profile settings
Scholarships	ScholarshipsPage.jsx	List of all scholarships
Student Dashboard	StudentDashboard.jsx	Student-only UI
Admin Panel	AdminPanel.jsx	Admin-only UI
🧩 Components
Component	Description
Layout.jsx	Wrapper layout for pages
Navigation.jsx	App’s navbar
ScholarshipCard.jsx	UI card for displaying individual scholarships
🧠 Context & Hooks
AuthContext

Handles authenticated user state.

useLocalStorage

Custom hook to sync state with browser storage.

🎨 Styling

The project uses:

Tailwind CSS (configured via tailwind.config.js)

PostCSS

Custom styling via index.css

🖥 Backend (server.js)

The project contains a lightweight Express server:

node server.js


Used for basic API endpoints or static hosting.

🤝 Contributing

Fork the repo

Create a new branch

git checkout -b feature-name


Commit + push

Create pull request

Follow existing code style (Tailwind + JSX conventions).

📜 License

No license file is included.
Consider adding MIT License for open-source distribution.

📫 Contact

Owner: @shubhamanand020
Issues & discussions: GitHub repository issues tab
