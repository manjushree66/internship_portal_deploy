def normalize_text(text):
    """
    Convert text into a simple comparable format.
    """
    return (
        text.lower()
        .replace(" ", "")
        .replace("-", "")
        .replace("_", "")
    )


def check_company_name(company_name, website_text):
    """
    Check whether the company name appears on the website.
    """

    company = normalize_text(company_name)
    website = normalize_text(website_text)

    if company in website:
        return True

    return False
def create_web_verification_result(
    website_accessible,
    original_domain,
    final_domain,
    redirect_domain_match,
    company_name_match,
    email_domain_match,
    domain_creation_date,
    domain_age_days
):
    """
    Combine all web-verification checks into one result.
    """

    return {
        "website_accessible": website_accessible,
        "original_domain": original_domain,
        "final_domain": final_domain,
        "redirect_domain_match": redirect_domain_match,
        "company_name_match": company_name_match,
        "email_domain_match": email_domain_match,
        "domain_creation_date": domain_creation_date,
        "domain_age_days": domain_age_days
    }