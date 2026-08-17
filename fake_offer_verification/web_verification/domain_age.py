import requests
import tldextract
from datetime import datetime, timezone

IANA_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json"


def get_registered_domain(domain):
    """
    Extract the registered domain from a domain name.
    Example:
        www.example.com -> example.com
    """

    extracted = tldextract.extract(domain)

    if not extracted.domain or not extracted.suffix:
        return None

    return f"{extracted.domain}.{extracted.suffix}".lower()


def get_tld(domain):
    """
    Extract the top-level domain.
    Example:
        example.com -> com
        example.in -> in
    """

    extracted = tldextract.extract(domain)

    if not extracted.suffix:
        return None

    return extracted.suffix.lower()


def find_rdap_server(domain):
    """
    Find the correct RDAP server for a domain
    using IANA's RDAP bootstrap registry.
    """

    try:
        response = requests.get(
            IANA_BOOTSTRAP_URL,
            timeout=10
        )

        if response.status_code != 200:
            return None

        bootstrap_data = response.json()

        tld = get_tld(domain)

        if not tld:
            return None

        for service in bootstrap_data.get("services", []):

            tlds = service[0]
            servers = service[1]

            if tld in tlds:
                return servers[0]

        return None

    except requests.RequestException:
        return None


def get_domain_creation_date(domain):
    """
    Find the domain's registration date using
    the correct RDAP server.
    """

    rdap_server = find_rdap_server(domain)

    if not rdap_server:
        return None

    url = f"{rdap_server}domain/{domain}"

    try:
        response = requests.get(
            url,
            timeout=10,
            headers={
                "Accept": "application/rdap+json"
            }
        )

        if response.status_code != 200:
            return None

        data = response.json()

        for event in data.get("events", []):

            if event.get("eventAction") == "registration":
                return event.get("eventDate")

        return None

    except requests.RequestException:
        return None
def calculate_domain_age(creation_date):
    """
    Calculate the age of a domain in days.
    """

    if not creation_date:
        return None

    creation_datetime = datetime.fromisoformat(
        creation_date.replace("Z", "+00:00")
    )

    current_datetime = datetime.now(timezone.utc)

    age = current_datetime - creation_datetime

    return age.days
if __name__ == "__main__":

    test_domains = [
        "example.com",
        "example.org",
        "example.in"
    ]

    for domain in test_domains:

        print("\nDomain:", domain)

        server = find_rdap_server(domain)

        print("RDAP server:", server)

        creation_date = get_domain_creation_date(domain)

        print("Creation date:", creation_date)

        age_days = calculate_domain_age(creation_date)

        print("Domain age (days):", age_days)
