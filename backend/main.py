
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from typing import Dict, List, Any

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "resume_data.json"

@app.get("/api/resume")
async def get_resume():
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="Resume data not found")
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    return data

@app.post("/api/resume")
async def update_resume(data: Dict[str, Any]):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)
    return {"message": "Resume updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
