from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logger import logger
from app.api.upload import router as upload_router
from app.api.health import router as health_router
from app.api.chat import router as chat_router

logger.info("Starting DocMind AI...")
app = FastAPI(title="DocMind AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(upload_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to DocMind AI"
    }