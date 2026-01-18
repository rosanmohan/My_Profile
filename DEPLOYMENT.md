# Free Deployment Guide (Render.com)

This guide explains how to deploy your portfolio for **FREE** using Render.com.
Render is an excellent platform that supports both your Python Backend and React Frontend.

## Prerequisites
1.  A [GitHub Account](https://github.com).
2.  A [Render.com Account](https://render.com) (register using GitHub).
3.  Your code pushed to a GitHub repository (You have already done this!).

---

## Part 1: Deploy the Backend (Python API)
The backend hosts your data (`resume_data.json`) and handles saving changes.

1.  **Login** to your Render Dashboard.
2.  Click the **"New +"** button and select **"Web Service"**.
3.  Select **"Build and deploy from a Git repository"** and click Next.
4.  Find your repository (`My_Profile` or similar) in the list and click **"Connect"**.
5.  **Configure the Service** with these exact settings:
    *   **Name**: `rosan-portfolio-api` (Unique name)
    *   **Region**: Singapore or Frankfurt (Choose closest to you)
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Instance Type**: Select **"Free"** (Scroll down to find it).
6.  Click **"Create Web Service"**.
7.  **Wait**: Render will build your app. This may take 2-3 minutes.
8.  **Success**: Once you see "Your service is live", look for the URL at the top left (e.g., `https://rosan-portfolio-api.onrender.com`).
    *   **COPY THIS URL**. You need it for the frontend.

> **Note on Free Tier**: The free backend "sleeps" after 15 minutes of inactivity. The first time you visit your site after a break, it might take 50 seconds to load. This is normal for free hosting.

---

## Part 2: Deploy the Frontend (React App)
The frontend is the visual portfolio that visitors will see.

1.  Go back to the Render Dashboard.
2.  Click **"New +"** and select **"Static Site"**.
3.  Connect the **SAME GitHub repository** again.
4.  **Configure the Site**:
    *   **Name**: `rosan-portfolio-ui`
    *   **Root Directory**: `frontend` (Important!)
    *   **Runtime**: `Node` (Default)
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
5.  **Add Environment Variables** (Critical Step):
    *   Scroll down to specific "Environment Variables" section.
    *   Click "Add Environment Variable".
    *   **Key**: `VITE_API_URL`
    *   **Value**: Paste the Backend URL you copied earlier AND add `/api/resume` to the end? **NO**, just the base URL.
        *   Example Value: `https://rosan-portfolio-api.onrender.com`
        *   (The app automatically appends `/api/resume` thanks to our code logic, but just to be safe, check `App.tsx`. Wait, logic says `const API_URL = import.meta.env.VITE_API_URL || '/api/resume';`. If you provide the base, standard Axios calls might need full path.
        *   **Correction**: In `App.tsx`, we use `axios.get(API_URL)`. So `API_URL` should be the FULL endpoint URL.
        *   **Value**: `https://rosan-portfolio-api.onrender.com/api/resume`
    *   *Self-Correction*: Let's verify `App.tsx`.
        *   Line: `const API_URL = import.meta.env.VITE_API_URL || '/api/resume';`
        *   Line: `axios.get(API_URL)`
        *   So yes, the variable must be the FULL URL to the endpoint.
6.  Click **"Create Static Site"**.
7.  **Wait**: Render will build your Javascript bundle.
8.  **Success**: You will get a URL (e.g., `https://rosan-portfolio-ui.onrender.com`).
9.  **Click it!** Your portfolio is now live.

---

## Part 3: Verify & Login
1.  Open your **Frontend URL**.
2.  It might take a minute to load data (waking up backend).
3.  Once loaded, you should see your profile.
4.  Click the **Lock Icon** (bottom right).
5.  Enter Password: `admin123`.
6.  Try editing a text and clicking **Save**.
7.  Refresh the page to ensure the change persisted.

## How to Update
Whenever you want to change code or fix bugs:
1.  Edit files on your computer.
2.  Run:
    ```bash
    git add .
    git commit -m "Fixed something"
    git push
    ```
3.  Render will **automatically detect the push** and re-deploy your site within minutes.
