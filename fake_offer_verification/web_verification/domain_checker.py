import tldextract


def get_domain(url):
    """
    Extract the full registered domain from a website URL.
    """

    extracted = tldextract.extract(url)

    if not extracted.domain or not extracted.suffix:
        return None

    return f"{extracted.domain}.{extracted.suffix}".lower()
def compare_domains(original_url, final_url):
    """
    Compare the domain entered by the student
    with the domain reached after redirects.
    """

    original_domain = get_domain(original_url)
    final_domain = get_domain(final_url)

    if not original_domain or not final_domain:
        return {
            "match": False,
            "original_domain": original_domain,
            "final_domain": final_domain
        }

    return {
        "match": original_domain == final_domain,
        "original_domain": original_domain,
        "final_domain": final_domain
    }
def get_email_domain(email):
    """
    Extract the domain from an email address.
    Example:
        hr@example.com -> example.com
    """

    if not email or "@" not in email:
        return None

    return email.split("@")[-1].strip().lower()


def compare_email_with_website(email, website_url):
    """
    Compare the email domain with the website domain.
    """

    email_domain = get_email_domain(email)
    website_domain = get_domain(website_url)

    if not email_domain or not website_domain:
        return {
            "match": False,
            "email_domain": email_domain,
            "website_domain": website_domain
        }

    return {
        "match": email_domain == website_domain,
        "email_domain": email_domain,
        "website_domain": website_domain
    }