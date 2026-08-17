import requests
from bs4 import BeautifulSoup


def scrape_website(url):
    try:
        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/151.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9"
            }
        )

        if response.status_code != 200:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": f"Website returned status code {response.status_code}"
            }

        soup = BeautifulSoup(response.text, "html.parser")

        title = soup.title.string.strip() if soup.title and soup.title.string else ""

        text = soup.get_text(" ", strip=True)

        return {
            "success": True,
            "status_code": response.status_code,
            "original_url": url,
            "final_url": response.url,
            "title": title,
            "text": text[:5000]
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "error": str(e)
        }