# 1. IMPORTS — always at the top

from company_resolver import create_company_record
from scraper import scrape_website
from verifier import (
    check_company_name,
    create_web_verification_result
)

from domain_checker import (
    get_domain,
    compare_domains,
    compare_email_with_website
)

from domain_age import (
    get_domain_creation_date,
    calculate_domain_age
)
# 2. TEST COMPANY DATA

company = create_company_record(
    company_name="Example Domain",
    company_website="https://example.com",
    email="hr@example.com"
)

print("Company record:")
print(company)


# 3. GET THE WEBSITE

website = company["company_website"]

domain = get_domain(website)

print("Domain:", domain)


# 4. SCRAPE THE WEBSITE

result = scrape_website(website)

if result["success"]:

    print("Original URL:", result["original_url"])
    print("Final URL:", result["final_url"])


    # 5. REDIRECT / DOMAIN CHECK

    redirect_check = compare_domains(
        result["original_url"],
        result["final_url"]
    )

    print("Original domain:", redirect_check["original_domain"])
    print("Final domain:", redirect_check["final_domain"])
    print("Domain match:", redirect_check["match"])
    

    # 6. COMPANY NAME ↔ WEBSITE CHECK

    website_text = result["title"] + " " + result["text"]

    company_match = check_company_name(
        company["company_name"],
        website_text
    )

    print("Company name found:", company_match)


    # 7. EMAIL ↔ WEBSITE DOMAIN CHECK  ← NEW

    email_check = compare_email_with_website(
        company["email"],
        company["company_website"]
    )

    print("Email domain:", email_check["email_domain"])
    print("Website domain:", email_check["website_domain"])
    print("Email/domain match:", email_check["match"])
    # 8. RDAP / DOMAIN AGE CHECK

    creation_date = get_domain_creation_date(domain)

    age_days = calculate_domain_age(creation_date)

    print("Domain creation date:", creation_date)
    print("Domain age (days):", age_days)
    web_result = create_web_verification_result(
        website_accessible=True,
        original_domain=redirect_check["original_domain"],
        final_domain=redirect_check["final_domain"],
        redirect_domain_match=redirect_check["match"],
        company_name_match=company_match,
        email_domain_match=email_check["match"],
        domain_creation_date=creation_date,
        domain_age_days=age_days
    )

    print("\n=== WEB VERIFICATION RESULT ===")
    print(web_result)

else:

    print("Website verification failed:")
    print(result)