import cv2
import numpy as np


def detect_change(
    before_path: str,
    after_path: str,
    output_path: str
):

    before = cv2.imread(before_path)
    after = cv2.imread(after_path)

    if before is None:
        raise ValueError(
            "Could not read before image"
        )

    if after is None:
        raise ValueError(
            "Could not read after image"
        )

    # Make both images the same size
    height, width = before.shape[:2]

    after = cv2.resize(
        after,
        (width, height)
    )

    before_gray = cv2.cvtColor(
        before,
        cv2.COLOR_BGR2GRAY
    )

    after_gray = cv2.cvtColor(
        after,
        cv2.COLOR_BGR2GRAY
    )

    difference = cv2.absdiff(
        before_gray,
        after_gray
    )

    _, mask = cv2.threshold(
        difference,
        30,
        255,
        cv2.THRESH_BINARY
    )

    changed_pixels = np.count_nonzero(mask)
    total_pixels = mask.size

    change_percentage = (
        changed_pixels / total_pixels
    ) * 100

    # Highlight changed regions in red
    result = after.copy()

    result[mask > 0] = [0, 0, 255]

    cv2.imwrite(
        output_path,
        result
    )

    return {
        "change_percentage": round(
            float(change_percentage), 2
        ),
        "changed_pixels": int(
            changed_pixels
        ),
        "total_pixels": int(
            total_pixels
        )
    }