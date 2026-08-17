def create_company_record(
    company_name=None,
    company_website=None,
    email=None,
    phone=None,
    address=None
):
    return {
        "company_name": company_name,
        "company_website": company_website,
        "email": email,
        "phone": phone,
        "address": address
    }