# Deployment Guide (Render.com)

This guide explains how to deploy both the **Frontend** and **Backend** on **Render.com**. This is the easiest free method as Render supports both static sites and web services from a single monorepo.

## 1. Prepare GitHub Repository
1.  Initialize git in the root folder (if you haven't already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub and push your code.

## 2. Deploy Backend (Web Service)
1.  Sign up/Login to [Render.com](https://render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    -   **Name**: `rosan-portfolio-api` (or similar)
    -   **Root Directory**: `backend`
    -   **Runtime**: Python 3
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    -   **Instance Type**: Free
5.  Click **Create Web Service**.
6.  Wait for the deployment to finish. **Copy the backend URL** (e.g., `https://rosan-portfolio-api.onrender.com`).

## 3. Deploy Frontend (Static Site)
1.  On the Render Dashboard, click **New +** and select **Static Site**.
2.  Connect the **same GitHub repository**.
3.  Configure the site:
    -   **Name**: `rosan-portfolio`
    -   **Root Directory**: `frontend`
    -   **Build Command**: `npm install && npm run build`
    -   **Publish Directory**: `dist`
4.  **Environment Variables** (Advanced):
    -   Key: `VITE_API_URL`
    -   Value: Paste your Backend URL from Step 2 (e.g., `https://rosan-portfolio-api.onrender.com`).
5.  Click **Create Static Site**.

## 4. Configure Frontend Code
You need to ensure your frontend code is set up to read the environment variable.

1.  Open `frontend/src/App.tsx`.
2.  Locate the API URL definition.
3.  Ensure it looks like this:
    ```typescript
    const API_URL = import.meta.env.VITE_API_URL || '/api/resume';
    ```
    *Note: The local fallback `/api/resume` is for development if you have a proxy set up, but on production, it will use the `VITE_API_URL`.*

## 5. Admin Access
-   The public URL will display your portfolio.
-   To access the Edit Mode, click the **Lock Icon** in the bottom right corner.
-   **Password**: `admin123`
