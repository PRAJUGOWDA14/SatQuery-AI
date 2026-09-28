import os
import uuid

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from services.router import route_query
from services.image_analysis import analyze_image
from services.gemini_service import analyze_image_with_gemini
from services.change_detection import detect_change


UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


app = FastAPI(
    title="SatQuery AI Backend",
    description="Backend API for SatQuery AI",
    version="1.0.0"
)


# Allow the React frontend to communicate
# with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Make uploaded images accessible
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


@app.get("/")
def root():
    return {
        "message": "SatQuery AI Backend is running",
        "status": "online"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "SatQuery AI Backend"
    }


@app.post("/api/analyze")
async def analyze(
    image: UploadFile = File(...),
    query: str = Form(...),
    analysis_type: str = Form("Auto Detect")
):

    if not image.content_type:
        raise HTTPException(
            status_code=400,
            detail="Invalid image"
        )

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ]

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload JPG, PNG or WEBP image"
        )

    file_extension = os.path.splitext(
        image.filename or ""
    )[1]

    filename = (
        f"{uuid.uuid4()}"
        f"{file_extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:
        buffer.write(
            await image.read()
        )

    # Decide which analysis the user requested
    if analysis_type == "Auto Detect":
        task = route_query(query)
    elif analysis_type == "Change Detection":
        task = "change_detection"
    elif analysis_type == "Visual Question Answering":
        task = "vqa_unavailable"
    elif analysis_type == "Object Detection":
        task = "object_detection_unavailable"
    elif analysis_type == "Land Cover Analysis":
        task = "land_cover_unavailable"
    elif analysis_type == "Spectral Analysis":
        task = "spectral_analysis_unavailable"
    else:
        task = route_query(query)

    # Analyze the uploaded image
    analysis = analyze_image(file_path)


    if task == "vegetation_analysis":

        answer = (
            f"The image contains an estimated "
            f"{analysis['vegetation_percentage']}% "
            f"vegetation based on "
            f"image-processing analysis."
        )


    elif task == "water_analysis":

        answer = (
            f"The estimated water-like region is "
            f"{analysis['water_percentage']}% "
            f"of the image."
        )


    elif task == "builtup_analysis":

        answer = (
            f"The estimated built-up/non-vegetation "
            f"region is approximately "
            f"{analysis['builtup_percentage']}%."
        )


    elif task == "change_detection":

        answer = (
            "Change detection requires a before image and an after image. "
            "Use the change-detection analysis with two images."
        )


    elif task == "area_analysis":

        answer = (
            "Area estimation requires the ground "
            "resolution or geospatial metadata "
            "of the satellite image."
        )


    elif task == "vqa_unavailable":

        try:
            answer = analyze_image_with_gemini(
                file_path,
                query
            )
        except Exception as e:
            print(f"Gemini error: {e}")
            answer = (
                f"Image analysis results: "
                f"water {analysis['water_percentage']}%, "
                f"built-up {analysis['builtup_percentage']}%, "
                f"vegetation {analysis['vegetation_percentage']}%, "
                f"and bright areas {analysis['bright_area_percentage']}%."
            )


    elif task == "object_detection_unavailable":

        answer = (
            "Object detection is not implemented "
            "in the current backend yet."
        )


    elif task == "land_cover_unavailable":

        answer = (
            "Land cover analysis is not implemented "
            "in the current backend yet."
        )


    elif task == "spectral_analysis_unavailable":

        answer = (
            "Spectral analysis is not implemented "
            "in the current backend yet."
        )


    else:

        try:
            answer = analyze_image_with_gemini(
                file_path,
                query
            )
        except Exception as e:
            print(f"Gemini error: {e}")
            answer = (
                f"Image analysis results: "
                f"water {analysis['water_percentage']}%, "
                f"built-up {analysis['builtup_percentage']}%, "
                f"vegetation {analysis['vegetation_percentage']}%, "
                f"and bright areas {analysis['bright_area_percentage']}%."
            )


    return {
        "success": True,
        "task": task,
        "query": query,
        "answer": answer,
        "analysis": analysis,
        "image_url": (
            f"/uploads/{filename}"
        )
    }


@app.post("/api/change-detection")
async def change_detection(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...)
):

    before_filename = (
        f"{uuid.uuid4()}_before.jpg"
    )

    after_filename = (
        f"{uuid.uuid4()}_after.jpg"
    )

    output_filename = (
        f"{uuid.uuid4()}_change.jpg"
    )


    before_path = os.path.join(
        UPLOAD_DIR,
        before_filename
    )

    after_path = os.path.join(
        UPLOAD_DIR,
        after_filename
    )

    output_path = os.path.join(
        UPLOAD_DIR,
        output_filename
    )


    with open(
        before_path,
        "wb"
    ) as buffer:
        buffer.write(
            await before_image.read()
        )


    with open(
        after_path,
        "wb"
    ) as buffer:
        buffer.write(
            await after_image.read()
        )


    result = detect_change(
        before_path,
        after_path,
        output_path
    )


    return {
        "success": True,
        "result": result,
        "before_image": (
            f"/uploads/{before_filename}"
        ),
        "after_image": (
            f"/uploads/{after_filename}"
        ),
        "change_image": (
            f"/uploads/{output_filename}"
        )
    }
