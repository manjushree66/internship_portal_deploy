import re


def normalize_text(value):
    """
    Convert text into a standard form so that
    small formatting differences don't cause mismatches.
    """

    if value is None:
        return ""

    value = str(value).lower().strip()

    value = re.sub(r"[^\w\s]", " ", value)

    value = re.sub(r"\s+", " ", value)

    return value


def normalize_email(email):
    """
    Normalize an email address.
    """

    if not email:
        return ""

    return str(email).strip().lower()


def normalize_phone(phone):
    """
    Keep only digits from a phone number.
    """

    if not phone:
        return ""

    return re.sub(r"\D", "", str(phone))