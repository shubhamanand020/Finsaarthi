# FinSaarthi Frontend

[![Open App](https://img.shields.io/badge/Open%20App-FinSaarthi-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://finsaarthi-six.vercel.app/)

## Repositories

- **Frontend**: [FinSaarthi-Frontend](https://github.com/shubhamanand020/Finsaarthi) (this repository)
- **Backend**: [FinSaarthi-Backend](https://github.com/shubhamanand020/Finsaarthi/tree/main/finsaarthi-backend)

## Project Overview

This frontend is the React (Vite) client for the FinSaarthi scholarship management system.
It provides role-based interfaces for students and admins and integrates with the Spring Boot backend for authentication, scholarship applications, document verification actions, and application status tracking.

The app communicates with backend APIs through a centralized Axios client in src/api/client.js.
That client applies the API base URL from environment variables, attaches JWT tokens for protected routes, and unwraps the backend ApiResponse payload format.

## Features

The frontend currently supports these real platform features:

- Student scholarship application submission.
- Document upload during application submission.
- Role-based UI rendering for student and admin flows.
- Admin review actions for application status updates.
- Admin document verification updates.
- Student-facing status tracking for submitted applications.
- Workflow-aligned status handling: PENDING -> UNDER_REVIEW -> VERIFIED -> APPROVED or REJECTED.
- Audit-trail-compatible admin actions by calling audited backend review/status APIs.

## Tech Stack

- React
- Vite
- Axios
- React Router
- Context API for global state (authentication and theme)

## Folder Structure

```
FinSaarthi/
├── src/
│   ├── component/
│   │   ├── CaptchaField.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   ├── ScholarshipCard.jsx
│   │   └── Skeleton.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useGlassEffect.js
│   │   ├── useScrollReveal.js
│   │   └── (other utility hooks)
│   ├── pages/
│   │   ├── AdminPanel.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ScholarshipApplyPage.jsx
│   │   ├── ScholarshipsPage.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── UpdateForgotPasswordPage.jsx
│   │   ├── VerifyForgotOtpPage.jsx
│   │   └── VerifyRegistrationOtpPage.jsx
│   ├── api/
│   │   └── client.js
│   ├── App.jsx
│   ├── index.pcss
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── server.js
├── tailwind.config.js
├── vercel.json
├── vite.config.js
└── README.md
```

Key folders:

- pages/: Route-level screens for all user flows (student and admin).
- component/: Reusable UI building blocks (layout, navigation, footer, cards, form helpers).
- contexts/: Global state providers (authentication, theme).
- hooks/: Custom hooks for UI logic (scroll reveal, styling effects).
- api/: API client configuration and utilities for backend communication.

## Setup Instructions

Run from the frontend project root:

```bash
npm install
npm run dev
```

Optional production build commands:

```bash
npm run build
npm run preview
```

## Environment Variables

Create a .env file in the frontend root.

Example:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Current implementation note:

- src/api/client.js reads VITE_API_URL.
- To match existing code without modifications, set:

```env
VITE_API_URL=http://localhost:8080/api
```

If you standardize on VITE_API_BASE_URL, update the Axios client accordingly.

## Application Workflow

### 1. Student Application Submission

1. Student registers or logs in.
2. Student opens a scholarship and starts the application.
3. Student enters required details and uploads required documents.
4. Frontend submits data to backend application APIs.

### 2. Admin Review Workflow

1. Admin opens the admin panel and views submitted applications.
2. Admin evaluates application data and updates status.
3. Status moves through the structured workflow:
   PENDING -> UNDER_REVIEW -> VERIFIED -> APPROVED or REJECTED.

### 3. Document Verification

1. Admin reviews uploaded documents linked to an application.
2. Admin updates document verification through verification endpoints.
3. Updated verification and application statuses are reflected in UI tracking views.

### 4. Tracking and Audit Alignment

1. Students view current application state in dashboard flows.
2. Admin actions are executed through backend endpoints that log review/audit records.
3. Status updates can trigger backend notification workflows.

## API Integration

Frontend API integration is centralized in src/api/client.js.

- Base URL: uses environment variable with localhost fallback.
- Auth: request interceptor appends Authorization Bearer token when available.
- Response handling: interceptor unwraps backend ApiResponse to reduce page-level parsing.
- Session handling: 401 responses on protected routes trigger logout flow and redirect.

Typical backend target in local development:

```text
http://localhost:8080/api
```

## Deployment (Vercel)

This frontend is deployed on Vercel at [https://finsaarthi-six.vercel.app/](https://finsaarthi-six.vercel.app/)

### Deployment Steps:

1. Push code to GitHub
2. Import project in Vercel from your GitHub repository
3. Configure environment variables in Vercel project settings:
   ```
   VITE_API_URL=<your-production-backend-url>
   ```
4. Deploy and monitor build logs

### Production Configuration:

- Ensure backend API is publicly accessible and CORS-enabled
- Update API base URL to match your production backend endpoint
- Verify all environment variables are set in Vercel dashboard
- Test API connectivity from the deployed frontend

### Notes:

- Backend must be running and accessible for frontend to function
- Session tokens are stored in browser localStorage
- Clear browser storage if experiencing auth issues in production

## Screens and Modules Overview

- **Public routes**: HomePage (with scholarship overview)
- **Auth routes**: LoginPage, RegisterPage, VerifyRegistrationOtpPage, ForgotPasswordPage, VerifyForgotOtpPage, UpdateForgotPasswordPage
- **Student routes**: ScholarshipsPage, ScholarshipApplyPage, StudentDashboard, ProfilePage
- **Admin routes**: AdminPanel (for application review and verification)

## Testing

Run the development server with hot reload:

```bash
npm run dev
```

Run the production build preview:

```bash
npm run build
npm run preview
```

Manual testing checklist:
- Student registration and OTP verification
- Scholarship browsing and application submission
- Document upload functionality
- Application status tracking from dashboard
- Admin review and verification workflows
- Status transitions and email notifications (if backend configured)

## Troubleshooting

- **API connection errors**: Verify `VITE_API_URL` environment variable is correctly set and backend is running
- **Authentication failures**: Clear localStorage and re-login; check if JWT_SECRET on backend matches
- **Document upload fails**: Ensure backend multipart form handling is configured and file size limits are adequate
- **Blank admin dashboard**: Verify admin user role is properly set in database
- **Build fails**: Run `npm install` again and ensure Node.js version is 16+
- **Styling issues**: Clear browser cache and run `npm run build` again

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following React and Tailwind CSS conventions
4. Commit your changes: `git commit -m 'Add your feature'`
5. Push to your fork: `git push origin feature/your-feature`
6. Open a pull request with a clear description

### Code Style:
- Use functional React components
- Follow camelCase naming for variables and functions
- Keep components focused and reusable
- Use Context API for state management where appropriate

## Contact and Support

For questions, issues, or feedback about the frontend:

- Issues: Use the GitHub repository Issues tab
- Email: finsaarthiindia@gmail.com
- GitHub: [@shubhamanand020](https://github.com/shubhamanand020)
- Backend Documentation: See [finsaarthi-backend/README.md](https://github.com/shubhamanand020/Finsaarthi/tree/main/finsaarthi-backend)
