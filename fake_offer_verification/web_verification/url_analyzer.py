import re
from urllib.parse import urlparse
import tldextract


SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "verification",
    "secure",
    "account",
    "update",
    "confirm",
    "password",
    "wallet",
    "claim",
    "urgent"
]


def analyze_url(url):
    """
    Analyze structural characteristics of a website URL.
    """

    parsed = urlparse(url)

    hostname = parsed.hostname or ""

    extracted = tldextract.extract(hostname)

    # Count subdomains
    subdomain_count = 0

    if extracted.subdomain:
        subdomain_count = len(
            extracted.subdomain.split(".")
        )

    # Count digits
    digit_count = sum(
        character.isdigit()
        for character in url
    )

    # Count special characters
    special_char_count = len(
        re.findall(r"[^a-zA-Z0-9]", url)
    )

    # Check whether hostname is an IP address
    has_ip_address = bool(
        re.fullmatch(
            r"\d{1,3}(\.\d{1,3}){3}",
            hostname
        )
    )

    # Check suspicious keywords
    url_lower = url.lower()

    suspicious_keywords_found = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in url_lower
    ]

    return {
        "url_length": len(url),
        "subdomain_count": subdomain_count,
        "digit_count": digit_count,
        "special_char_count": special_char_count,
        "has_ip_address": has_ip_address,
        "suspicious_keywords": suspicious_keywords_found,
        "suspicious_keyword": len(suspicious_keywords_found) > 0
    }


if __name__ == "__main__":

    test_url = "https://example.com"

    result = analyze_url(test_url)

    print(result)