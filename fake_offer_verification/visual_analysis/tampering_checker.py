import cv2


def analyze_image_quality(image_path):
    """
    Calculate basic visual statistics that can be used
    as tampering-related features.

    These values do NOT prove tampering.
    """

    image = cv2.imread(image_path)

    if image is None:
        return {
            "success": False,
            "error": "Document image could not be loaded"
        }

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    edges = cv2.Canny(
        gray,
        100,
        200
    )

    edge_pixels = cv2.countNonZero(edges)

    total_pixels = edges.shape[0] * edges.shape[1]

    edge_ratio = edge_pixels / max(total_pixels, 1)

    return {
        "success": True,
        "edge_ratio": round(edge_ratio, 4)
    }