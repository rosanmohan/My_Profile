
import os
from pypdf import PdfReader

# Adjust path to where the PDF is located relative to this script
pdf_path = os.path.join("..", "Rosan_Resume_GenAI.pdf")

try:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open("resume_text_utf8.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Text extracted to resume_text_utf8.txt")
except Exception as e:
    print(f"Error extracting text: {e}")
