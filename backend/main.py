from fastapi import FastAPI, UploadFile, File
from pdf_reader import extract_text
from text_splitter import split_text
import shutil
import os

app = FastAPI()

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)
    chunks = split_text(text)

    return {
        "filename": file.filename,
        "total_chunks": len(chunks),
        "first_chunk": chunks[0],
        "second_chunk": chunks[1] if len(chunks) > 1 else ""   # First 1000 characters
    }