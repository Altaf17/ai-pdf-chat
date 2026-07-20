from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from app.services.embed_service import query_chunks
from app.services.chat_service import ask
from app.services.history_service import save_message, get_history

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    doc_id: str
    question: str

    @field_validator("question")
    @classmethod
    def question_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Question cannot be empty")
        if len(v) > 2000:
            raise ValueError("Question too long (max 2000 characters)")
        return v.strip()


@router.get("/history/{doc_id}")
def chat_history(doc_id: str):
    return {"history": get_history(doc_id)}


@router.post("/")
async def chat(req: ChatRequest):
    try:
        chunks = query_chunks(req.doc_id, req.question)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found. Please upload the PDF again.")
    except Exception as e:
        if "429" in str(e):
            raise HTTPException(status_code=429, detail=f"Embedding rate limit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    try:
        answer = ask(chunks, req.question)
    except Exception as e:
        if "429" in str(e):
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    save_message(req.doc_id, "user", req.question)
    save_message(req.doc_id, "ai", answer)

    return {"answer": answer}
