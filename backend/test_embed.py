import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

result = genai.embed_content(model="models/gemini-embedding-001", content=["hello world", "test chunk"])
print("Success:", len(result["embedding"]), "embeddings")
print("Dim:", len(result["embedding"][0]))
