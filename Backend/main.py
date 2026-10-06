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
from services.image_analysis import analyze_image, spectral_proxy_analysis
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
    after_image: UploadFile | None = File(None),
    query: str = Form(...),
    analysis_type: str = Form("Auto Detect"),
    gsd: float | None = Form(None)
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

    after_file_path = None
    if after_image is not None:
        after_extension = os.path.splitext(after_image.filename or "")[1]
        after_filename = f"{uuid.uuid4()}{after_extension}"
        after_file_path = os.path.join(UPLOAD_DIR, after_filename)
        with open(after_file_path, "wb") as buffer:
            buffer.write(await after_image.read())

    # Decide which analysis the user requested
    if analysis_type == "Auto Detect":
        task = route_query(query)
    elif analysis_type == "Change Detection":
        task = "change_detection"
    elif analysis_type == "Visual Question Answering":
        task = "vqa_unavailable"
    elif analysis_type == "Object Detection":
        task = "object_detection"
    elif analysis_type == "Land Cover Analysis":
        task = "land_cover_analysis"
    elif analysis_type == "Spectral Analysis":
        task = "spectral_analysis"
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

        if not after_file_path:
            answer = (
                "Change detection requires a before image and an after image. "
                "Please upload both images."
            )
        else:
            output_filename = f"{uuid.uuid4()}_change.png"
            output_path = os.path.join(UPLOAD_DIR, output_filename)

            change_result = detect_change(
                file_path,
                after_file_path,
                output_path
            )

            answer = (
                f"Change detected across {change_result['change_percentage']}% of the image."
            )


    elif task == "area_analysis":

        if gsd is None or gsd <= 0:
            answer = (
                "Area estimation requires the ground "
                "resolution (GSD) of the satellite image. "
                "Please provide the image resolution in metres per pixel."
            )
        else:
            total_pixels = analysis["total_pixels"]
            area_m2 = total_pixels * (gsd ** 2)
            area_km2 = area_m2 / 1_000_000
            area_acres = area_m2 / 4046.8564224
            area_guntas = area_acres * 40

            answer = (
                f"Estimated total area: {area_km2:.4f} km², "
                f"{area_acres:.2f} acres, "
                f"{area_guntas:.2f} guntas "
                f"(GSD: {gsd:g} m/pixel)."
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


    elif task == "object_detection":

        answer = analyze_image_with_gemini(
            file_path,
            """Analyze this satellite or aerial image for object detection.

Identify the visible objects and structures such as:
- buildings
- roads
- vehicles
- water bodies
- trees or vegetation
- agricultural fields
- bridges
- other clearly visible man-made or natural objects

Return a concise list of detected objects. Do not invent objects that are not clearly visible.
For each object type, briefly describe where it appears in the image."""
        )


    elif task == "land_cover_analysis":

        try:
            answer = analyze_image_with_gemini(
                file_path,
                """Analyze this satellite image for land cover classification.

Identify the major land-cover classes that are clearly visible, such as:
- water
- vegetation/forest
- agricultural land
- built-up/urban areas
- roads
- bare land or other visible surfaces

Give a concise summary of the major land-cover classes and where they appear.
Do not invent classes that are not clearly visible."""
            )

            answer = (
                f"{answer}\\n\\n"
                f"Image-processing estimates: "
                f"vegetation {analysis['vegetation_percentage']}%, "
                f"water {analysis['water_percentage']}%, "
                f"built-up/other {analysis['builtup_percentage']}%."
            )

        except Exception as e:
            print(f"Gemini land cover error: {e}")

            answer = (
                f"Land cover estimates: "
                f"vegetation {analysis['vegetation_percentage']}%, "
                f"water {analysis['water_percentage']}%, "
                f"built-up/other {analysis['builtup_percentage']}%."
            )


    elif task == "spectral_analysis":

        spectral = spectral_proxy_analysis(file_path)

        answer = (
            "RGB-derived spectral proxy analysis:\n"
            f"Red mean: {spectral['red_mean']}\n"
            f"Green mean: {spectral['green_mean']}\n"
            f"Blue mean: {spectral['blue_mean']}\n"
            f"Red fraction: {spectral['red_fraction']}\n"
            f"Green fraction: {spectral['green_fraction']}\n"
            f"Blue fraction: {spectral['blue_fraction']}\n"
            f"Vegetation proxy: {spectral['vegetation_proxy_mean']}\n"
            f"Water proxy: {spectral['water_proxy_mean']}\n\n"
            f"{spectral['note']}"
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


    response_data = {
        "success": True,
        "task": task,
        "query": query,
        "answer": answer,
        "analysis": analysis,
        "image_url": (
            f"/uploads/{filename}"
        )
    }

    if task == "area_analysis" and gsd is not None and gsd > 0:
        response_data["area_km2"] = area_km2
        response_data["area_acres"] = area_acres
        response_data["area_guntas"] = area_guntas
        response_data["gsd_m_per_pixel"] = gsd
        response_data["area"] = {"value": round(area_km2, 4), "unit": "km²"}

    if task == "change_detection" and after_file_path:
        response_data["overlay_url"] = f"/uploads/{output_filename}"
        response_data["change_percentage"] = change_result["change_percentage"]
        response_data["changed_pixels"] = change_result["changed_pixels"]
        response_data["total_pixels"] = change_result["total_pixels"]

    return response_data


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
