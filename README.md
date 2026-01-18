# Interactive Portfolio for Rosan Mohan Sahoo

This is an interactive, editable portfolio website built with React, Tailwind CSS, and Python (FastAPI).

## Features
- **Modern Design**: Glassmorphism, animations, and responsive layout.
- **Editable UI**: Edit your profile directly on the page and save changes.
- **Data Persistence**: Changes are saved to `backend/resume_data.json`.

## How to Run

### 1. Start the Backend
The backend serves the resume data and handles updates.
Open a terminal:
```bash
cd rosan-portfolio/backend
# Activate virtual environment if not already active
..\venv\Scripts\activate
# Run the server
python main.py
```
The API will run at `http://localhost:8000`.

### 2. Start the Frontend
The frontend is the user interface.
Open a new terminal:
```bash
cd rosan-portfolio/frontend
npm install  # First time only
npm run dev
```
The app will open at `http://localhost:5173`.

## Customization
- **Images**: Add an image to `frontend/public/` and update the `image_url` in `backend/resume_data.json` or via the UI if implemented.
- **Styles**: Modify `frontend/src/index.css` or `tailwind.config.js`.
