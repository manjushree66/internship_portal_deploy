import cv2


def detect_signature_region(image_path):
    """
    Look for ink-like activity in the lower portion
    of the document.

    This detects a possible signature region.
    It does NOT verify that the signature is genuine.
    """

    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        return {
            "success": False,
            "error": "Document image could not be loaded"
        }

    height, width = image.shape

    # Look at the bottom 35% of the document.
    bottom_region = image[
        int(height * 0.65):height,
        0:width
    ]

    _, thresholded = cv2.threshold(
        bottom_region,
        180,
        255,
        cv2.THRESH_BINARY_INV
    )

    ink_pixels = cv2.countNonZero(thresholded)

    total_pixels = thresholded.shape[0] * thresholded.shape[1]

    ink_ratio = ink_pixels / max(total_pixels, 1)

    possible_signature = (
        0.001 < ink_ratio < 0.15
    )

    return {
        "success": True,
        "possible_signature": possible_signature,
        "ink_ratio": round(ink_ratio, 4)
    }