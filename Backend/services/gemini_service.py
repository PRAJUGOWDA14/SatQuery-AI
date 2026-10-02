import os
import mimetypes

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

def analyze_image_with_gemini(image_path: str, query: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=api_key)

    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"

    contents = [
        types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type,
        ),
        query,
    ]

    last_error = None

    for model in ( "gemini-3.5-flash-lite",):
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
            )

            return response.text or "Gemini did not return an answer."

        except Exception as e:
            last_error = e
            print(f"Gemini model {model} error: {e}")

    raise last_error
