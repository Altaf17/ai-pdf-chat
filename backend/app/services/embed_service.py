import json
import os
import math
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.logger import logger

_genai = genai.Client(api_key=settings.GOOGLE_API_KEY)
_STORE_DIR = os.path.abspath(settings.VECTOR_STORE_DIR)


def _embed_one(text: str) -> list[float]:
    response = _genai.models.embed_content(
        model=settings.EMBED_MODEL,
        contents=types.Content(parts=[types.Part(text=text)])
    )
    return response.embeddings[0].values


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def store_chunks(doc_id: str, chunks: list[str]):
    os.makedirs(_STORE_DIR, exist_ok=True)
    embeddings = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Embedding chunk {i+1}/{len(chunks)} for {doc_id}")
        embeddings.append(_embed_one(chunk))
    with open(os.path.join(_STORE_DIR, f"{doc_id}.json"), "w") as f:
        json.dump({"chunks": chunks, "embeddings": embeddings}, f)
    logger.info(f"Saved vector store for {doc_id}")


def query_chunks(doc_id: str, question: str, n_results: int = 5) -> list[str]:
    path = os.path.join(_STORE_DIR, f"{doc_id}.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"No vector store for doc {doc_id}")
    with open(path) as f:
        data = json.load(f)
    q_emb = _embed_one(question)
    scored = sorted(
        zip(data["chunks"], data["embeddings"]),
        key=lambda x: _cosine_similarity(q_emb, x[1]),
        reverse=True
    )
    return [chunk for chunk, _ in scored[:n_results]]
