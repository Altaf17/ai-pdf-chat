from google import genai
from app.core.config import settings

_client = genai.Client(api_key=settings.GOOGLE_API_KEY)

_SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions strictly based on the provided document context. "
    "If the answer is not found in the context, say so clearly. "
    "Be concise, accurate, and format your response using markdown when helpful."
)


def ask(context_chunks: list[str], question: str) -> str:
    context = "\n\n".join(context_chunks)
    prompt = f"{_SYSTEM_PROMPT}\n\nContext:\n{context}\n\nQuestion: {question}"
    response = _client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt
    )
    return response.text
