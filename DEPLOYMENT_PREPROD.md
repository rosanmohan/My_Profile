# Portfolio Deployment Guide

This guide explains how to deploy the Multi-User Portfolio Application with permanent data storage.

## Architecture

*   **Frontend**: React (Vite) -> Deployed on Vercel / Netlify / Render (Static Site)
*   **Backend**: FastAPI (Python) -> Deployed on Render / Railway (Web Service)
*   **Database**: PostgreSQL -> Deployed on Neon.tech / Render / Supabase (Managed DB)
*   **File Storage**: Cloudinary -> For permanent image hosting

---

## Step 1: Set up Cloud Services (Free Tiers)

1.  **Database (PostgreSQL)**
    *   Sign up at [Neon.tech](https://neon.tech) (Free).
    *   Create a Project.
    *   Copy the **Connection String** (e.g., `postgres://user:pass@host/neondb`).

2.  **File Storage (Cloudinary)**
    *   Sign up at [Cloudinary](https://cloudinary.com/) (Free).
    *   Go to Dashboard and copy: `Cloud Name`, `API Key`, `API Secret`.

---

## Step 2: Deploy Backend (Render.com)

1.  Push your code to **GitHub**.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Build Command**: `pip install -r backend/requirements.txt`
6.  **Start Command**: `cd backend && python main.py`
7.  **Environment Variables** (Add these in the deployment settings):
    *   `SQLALCHEMY_DATABASE_URL`: (Paste your Neon Connection String)
    *   `CLOUDINARY_CLOUD_NAME`: (Your Cloud Name)
    *   `CLOUDINARY_API_KEY`: (Your API Key)
    *   `CLOUDINARY_API_SECRET`: (Your API Secret)
    *   `SECRET_KEY`: (Generate a random string for security)
8.  Click **Deploy**.

---

## Step 3: Deploy Frontend (Vercel)

1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Vite.
5.  **Root Directory**: `frontend`.
6.  **Environment Variables**:
    *   `VITE_API_URL`: (The URL of your deployed Render Backend, e.g., `https://my-api.onrender.com`)
7.  Click **Deploy**.

---

## Verification

1.  Open your Vercel URL.
2.  Register a user.
3.  Upload a profile picture.
4.  **Verify Permanence**: Even if you redeploy the backend on Render, your User Data (stored in Neon) and Image (stored in Cloudinary) will remain safe!
