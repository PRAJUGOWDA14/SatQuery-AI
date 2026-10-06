from PIL import Image
import numpy as np


def analyze_image(image_path: str):
    image = Image.open(image_path).convert("RGB")
    img = np.array(image)

    height, width, _ = img.shape
    total_pixels = height * width

    r = img[:, :, 0].astype(float)
    g = img[:, :, 1].astype(float)
    b = img[:, :, 2].astype(float)

    # Simple color-based estimates.
    # This is NOT a trained remote-sensing classifier.

    vegetation_mask = (
        (g > r * 1.08) &
        (g > b * 1.05)
    )

    water_mask = (
        (b > r * 1.10) &
        (b > g * 1.03)
    )

    bright_mask = (
        (r > 150) &
        (g > 150) &
        (b > 150)
    )

    vegetation_percentage = (
        vegetation_mask.sum() / total_pixels
    ) * 100

    water_percentage = (
        water_mask.sum() / total_pixels
    ) * 100

    bright_percentage = (
        bright_mask.sum() / total_pixels
    ) * 100

    builtup_percentage = max(
        0,
        100 - vegetation_percentage - water_percentage
    )

    return {
        "image_width": width,
        "image_height": height,
        "total_pixels": total_pixels,

        "vegetation_percentage": round(
            float(vegetation_percentage), 2
        ),

        "water_percentage": round(
            float(water_percentage), 2
        ),

        "builtup_percentage": round(
            float(builtup_percentage), 2
        ),

        "bright_area_percentage": round(
            float(bright_percentage), 2
        )
    }

def spectral_proxy_analysis(image_path: str):
    """
    RGB-derived spectral proxy analysis.

    This is NOT true multispectral analysis because ordinary RGB images
    do not contain a dedicated NIR band.
    """

    image = Image.open(image_path).convert("RGB")
    img = np.array(image).astype(float)

    r = img[:, :, 0]
    g = img[:, :, 1]
    b = img[:, :, 2]

    # Normalized RGB indices.
    # These are image-derived proxies, not true satellite spectral indices.
    total = r + g + b + 1e-6

    red_fraction = r / total
    green_fraction = g / total
    blue_fraction = b / total

    # Green dominance proxy.
    vegetation_proxy = (g - r) / (g + r + 1e-6)

    # Blue dominance proxy.
    water_proxy = (b - r) / (b + r + 1e-6)

    return {
        "red_mean": round(float(np.mean(r)), 2),
        "green_mean": round(float(np.mean(g)), 2),
        "blue_mean": round(float(np.mean(b)), 2),
        "red_fraction": round(float(np.mean(red_fraction)), 4),
        "green_fraction": round(float(np.mean(green_fraction)), 4),
        "blue_fraction": round(float(np.mean(blue_fraction)), 4),
        "vegetation_proxy_mean": round(float(np.mean(vegetation_proxy)), 4),
        "water_proxy_mean": round(float(np.mean(water_proxy)), 4),
        "note": (
            "RGB-derived spectral proxy analysis. "
            "True NDVI and multispectral indices require a dedicated NIR band."
        )
    }
