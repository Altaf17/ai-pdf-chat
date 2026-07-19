from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


@router.get("/")
def health():

    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "upload_folder": settings.UPLOAD_FOLDER
    }