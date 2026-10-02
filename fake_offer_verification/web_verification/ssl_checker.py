from urllib.parse import urlparse
import requests


def check_https_ssl(url):

    parsed = urlparse(url)

    https_enabled = parsed.scheme.lower() == "https"

    result = {
        "https_enabled": https_enabled,
        "ssl_valid": False
    }

    if not https_enabled:
        return result

    try:
        response = requests.get(
            url,
            timeout=10
        )

        result["ssl_valid"] = True

    except requests.exceptions.SSLError:
        result["ssl_valid"] = False

    except requests.exceptions.RequestException:
        result["ssl_valid"] = False

    return result


if __name__ == "__main__":

    test_url = "https://example.com"

    result = check_https_ssl(test_url)

    print(result)