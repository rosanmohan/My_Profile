# Interactive Portfolio Template

This is a professional, interactive portfolio website built with **React**, **Tailwind CSS**, and **Python (FastAPI)**.
It features a beautiful UI, localized editing (CMS-like), PDF generation, and mobile responsiveness.

## Features
- **Editable UI**: Click the lock icon, log in, and edit text/skills/projects directly on the screen.
- **PDF Download**: Generates a professional resume PDF from your live profile data.
- **Glassmorphism Design**: Modern, clean, and visually appealing.
- **Responsive**: Works perfectly on Desktop, Tablet, and Mobile.
- **App-like Modals**: Click on Experience/Projects to view details in a popup.

---

## 🚀 How to Make This YOUR Portfolio (Step-by-Step)

If you have downloaded this code or cloned it, follow these steps to set it up for yourself.

### 1. Setup the Project
**Open a terminal** in the project folder.

**Step A: Setup Backend (Python)**
The backend stores your data (`resume_data.json`).
```bash
cd backend
python -m venv venv            # Create a virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt # Install dependencies
```

**Step B: Setup Frontend (React)**
The frontend is the website you see.
```bash
cd ../frontend
npm install                    # Install dependencies
```

### 2. Run Locally to Edit
You need to run the app locally to change the details (Name, Skills, etc.) easily.

**Terminal 1 (Backend):**
```bash
cd backend
# Ensure venv is active
python main.py
```
*Backend runs at: http://localhost:8000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend runs at: http://localhost:5173*

### 3. Customize Your Profile
1.  Open `http://localhost:5173` in your browser.
2.  Click the **Lock Icon** (Bottom Right).
3.  Enter Password: `admin123`.
4.  **Edit Everything**:
    -   Click on your **Name**, **Title**, **Summary** to edit.
    -   Click **Experience** or **Projects** to edit details inside popups.
    -   **Add/Remove** items using the "+" and Trash icons.
    -   **Skills**: Click on a category title to rename it, or edit the skill list text box.
5.  Click **Save** (Floppy Disk Icon) when done.

**Note**: All changes are saved to `backend/resume_data.json`.

---

## 🌍 How to Deploy (Go Live)
Once you have customized the portfolio locally:

1.  **Create your own GitHub Repository**.
2.  Push your code there.
3.  Follow the instructions in **[DEPLOYMENT.md](DEPLOYMENT.md)** to host it for FREE.
