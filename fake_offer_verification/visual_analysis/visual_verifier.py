from logo_checker import compare_logo
from signature_checker import detect_signature_region
from tampering_checker import analyze_image_quality


def analyze_document(
    document_image_path,
    reference_logo_path=None
):
    """
    Run all visual checks on one document image.
    """

    result = {}

    # -------------------------
    # Logo analysis
    # -------------------------

    if reference_logo_path:

        logo_result = compare_logo(
            reference_logo_path,
            document_image_path
        )

    else:

        logo_result = {
            "success": False,
            "error": "No reference logo provided"
        }

    result["logo"] = logo_result

    # -------------------------
    # Signature analysis
    # -------------------------

    signature_result = detect_signature_region(
        document_image_path
    )

    result["signature"] = signature_result

    # -------------------------
    # Tampering-related features
    # -------------------------

    tampering_result = analyze_image_quality(
        document_image_path
    )

    result["tampering"] = tampering_result

    return result