# Multi-User Resume Platform Implementation Plan

This plan outlines the steps to convert the single-user portfolio into a multi-user SaaS platform where anyone can register, create, and manage their own resume.

## Phase 1: Backend Architecture (FastAPI + SQLite)

1.  **Dependencies**: Install necessary libraries for database and auth.
    *   `sqlalchemy` (Database ORM)
    *   `passlib[bcrypt]` (Password hashing)
    *   `python-jose[cryptography]` (JWT Token handling)
    *   `python-multipart` (Login form handling)

2.  **Database Setup**:
    *   Create `database.py`: Configure SQLite connection.
    *   Create `models.py`: Define `User` table (id, email, password) and `Resume` table (id, user_id, data_json).

3.  **Authentication System**:
    *   Create `auth.py`: Functions to hash passwords (`bcrypt`) and create/verify access tokens (`JWT`).
    *   Create `schemas.py`: Pydantic models for UserCreate, UserLogin, Token.

4.  **API Endpoints (`main.py`)**:
    *   `POST /auth/register`: Create new user.
    *   `POST /auth/login`: Validate credentials, return JWT.
    *   `GET /api/resume`: Fetch resume *only for the authenticated user*.
    *   `POST /api/resume`: Save resume *only for the authenticated user*.

## Phase 2: Frontend Architecture (React + Router)

1.  **Dependencies**:
    *   Install `react-router-dom` for handling Page navigation (Login -> Dashboard).

2.  **Authentication Logic**:
    *   Create `context/AuthContext.tsx`: Manage global user login state and store the Token.
    *   Create `api.ts`: Configure Axios to automatically attach the `Authorization: Bearer <token>` header.

3.  **New Pages**:
    *   `pages/Login.tsx`: Login form.
    *   `pages/Register.tsx`: User registration form.
    *   `pages/Dashboard.tsx`: The current "Resume Editor" interface (moved from `App.tsx`).

4.  **Routing (`App.tsx`)**:
    *   Setup standard routes: ` /login`, `/register`.
    *   Setup protected route: `/` (Dashboard) - redirects to Login if not authenticated.

## Phase 3: Data Migration
*   Ensure the existing `resume_data.json` logic is deprecated in favor of the Database logic.
*   (Optional) Create a script to import the current `resume_data.json` into the first user's account.

## Execution Order
1.  Backend: Install Deps & Setup Database/Auth.
2.  Backend: Update API Endpoints.
3.  Frontend: Install Router & Setup Pages.
4.  Frontend: Connect Auth & Testing.
