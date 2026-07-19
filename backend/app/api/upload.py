import os
import uuid
import json
import threading
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings
from app.core.logger import logger
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embed_service import store_chunks

router = APIRouter(prefix="/upload", tags=["Upload"])

_executor = ThreadPoolExecutor(max_workers=2)
_STATUS_FILE = "doc_status.json"
_status_lock = threading.Lock()

MAX_BYTES = settings.MAX_UPLOAD_MB * 1024 * 1024


def _read_status() -> dict:
    with _status_lock:
        if os.path.exists(_STATUS_FILE):
            with open(_STATUS_FILE) as f:
                return json.load(f)
        return {}


def _write_status(doc_id: str, status: str):
    with _status_lock:
        data = {}
        if os.path.exists(_STATUS_FILE):
            with open(_STATUS_FILE) as f:
                data = json.load(f)
        data[doc_id] = status
        with open(_STATUS_FILE, "w") as f:
            json.dump(data, f)


def process_pdf(doc_id: str, save_path: str):
    try:
        logger.info(f"Extracting text for {doc_id}")
        text = PDFService.extract_text(save_path)
        if not text.strip():
            _write_status(doc_id, "error:no_text")
            return
        logger.info(f"Splitting text for {doc_id}")
        chunks = ChunkService.split_text(text)
        logger.info(f"Embedding {len(chunks)} chunks for {doc_id}")
        store_chunks(doc_id, chunks)
        logger.info(f"Stored {len(chunks)} chunks for doc {doc_id}")
        _write_status(doc_id, "ready")
    except Exception as e:
        logger.error(f"Processing error for {doc_id}: {e}")
        _write_status(doc_id, f"error:{str(e)}")


@router.post("/", status_code=202)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_MB}MB limit")

    doc_id = str(uuid.uuid4())
    upload_dir = os.path.abspath(settings.UPLOAD_FOLDER)
    os.makedirs(upload_dir, exist_ok=True)
    save_path = os.path.join(upload_dir, f"{doc_id}.pdf")

    with open(save_path, "wb") as f:
        f.write(contents)
        f.flush()
        os.fsync(f.fileno())

    logger.info(f"Saved PDF: {save_path} ({len(contents)} bytes)")
    _write_status(doc_id, "processing")

    loop = asyncio.get_running_loop()
    loop.run_in_executor(_executor, process_pdf, doc_id, save_path)

    return {"doc_id": doc_id, "status": "processing"}


@router.get("/status/{doc_id}")
def get_status(doc_id: str):
    status = _read_status().get(doc_id, "not_found")
    return {"doc_id": doc_id, "status": status}
