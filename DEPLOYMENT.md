# ☁️ Free Deployment Guide (Render.com)

This guide explains how to deploy your portfolio for **FREE** so anyone can visit it on the internet.
We will use **Render.com** because it is free, easy, and supports our tech stack.

## Prerequisites
1.  **Your own GitHub Repository**:
    *   If you haven't already, run these commands in your project folder to push your code to your own GitHub:
    ```bash
    git init
    git add .
    git commit -m "My Portfolio"
    # Create a new repo on GitHub.com first, then:
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    git push -u origin main
    ```
2.  A [Render.com Account](https://render.com) (Log in with GitHub).

---

## Part 1: Deploy the Backend (Python API)
*This stores your data and allows saving changes.*

1.  **Login** to your Render Dashboard.
2.  Click **"New +"** -> **"Web Service"**.
3.  Select **"Build and deploy from a Git repository"**.
4.  Connect your GitHub repository.
5.  **Configure Settings** (Exact Values Required):
    *   **Name**: `my-portfolio-api` (Choose a unique name)
    *   **Region**: Singapore or Frankfurt (Choose closest to you)
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Instance Type**: **Free** (Scroll down to select).
6.  Click **"Create Web Service"**.
7.  **Wait** until it says "Live".
8.  **COPY the Backend URL** from the top left (e.g., `https://my-portfolio-api.onrender.com`).

---

## Part 2: Deploy the Frontend (Website)
*This is what people will see.*

1.  Go back to Render Dashboard.
2.  Click **"New +"** -> **"Static Site"**.
3.  Connect the **SAME GitHub repository**.
4.  **Configure Settings**:
    *   **Name**: `my-portfolio-ui`
    *   **Root Directory**: `frontend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
5.  **Environment Variables** (Crucial Step):
    *   Scroll down to "Environment Variables".
    *   Click "Add Environment Variable".
    *   **Key**: `VITE_API_URL`
    *   **Value**: Paste your Backend URL and add `/api/resume` at the end.
        *   Format: `https://YOUR-APP-NAME.onrender.com/api/resume`
6.  Click **"Create Static Site"**.
7.  **Wait** for build to finish.
8.  **Done!** Click the link to view your live portfolio.

---

## 💡 Using Your Live Portfolio
*   **Initial Load**: The free server "sleeps" when not used. The first time you load the site, it might take **1 minute** to wake up and show data. This is normal.
*   **Admin Access**:
    *   Click the **Lock Icon** (Bottom Right).
    *   Default Password: `admin123`.
    *   Edit your content and click **Save**.
