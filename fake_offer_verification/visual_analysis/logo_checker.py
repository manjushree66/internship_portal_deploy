import cv2


def compare_logo(reference_logo_path, document_image_path):
    """
    Compare a known reference logo with a document image.

    This is a similarity signal, not proof of authenticity.
    """

    reference = cv2.imread(reference_logo_path, cv2.IMREAD_GRAYSCALE)
    document = cv2.imread(document_image_path, cv2.IMREAD_GRAYSCALE)

    if reference is None:
        return {
            "success": False,
            "error": "Reference logo could not be loaded"
        }

    if document is None:
        return {
            "success": False,
            "error": "Document image could not be loaded"
        }

    orb = cv2.ORB_create(nfeatures=1000)

    reference_keypoints, reference_descriptors = orb.detectAndCompute(
        reference,
        None
    )

    document_keypoints, document_descriptors = orb.detectAndCompute(
        document,
        None
    )

    if reference_descriptors is None or document_descriptors is None:
        return {
            "success": True,
            "logo_match": False,
            "similarity_score": 0.0
        }

    matcher = cv2.BFMatcher(
        cv2.NORM_HAMMING,
        crossCheck=True
    )

    matches = matcher.match(
        reference_descriptors,
        document_descriptors
    )

    matches = sorted(
        matches,
        key=lambda match: match.distance
    )

    good_matches = [
        match for match in matches
        if match.distance < 60
    ]

    score = len(good_matches) / max(
        len(reference_keypoints),
        1
    )

    return {
        "success": True,
        "logo_match": score >= 0.05,
        "similarity_score": round(score, 4),
        "matching_features": len(good_matches)
    }