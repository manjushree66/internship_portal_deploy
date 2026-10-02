def combine_agent3_results(
    web_result,
    database_verification,
    visual_verification
):
    """
    Combine the three Agent 3 verification modules
    into one result for Agent 4.
    """

    return {
        "web_verification": web_result,
        "database_verification": database_verification,
        "visual_verification": visual_verification
    }
if __name__ == "__main__":

    web_result = {
        "website_accessible": True,
        "redirect_domain_match": True,
        "company_name_match": True,
        "email_domain_match": True,
        "domain_age_days": 11326
    }

    database_verification = {
        "student_verification": {},
        "company_verification": {}
    }

    visual_verification = {
        "logo": {},
        "signature": {},
        "tampering": {}
    }

    agent3_result = combine_agent3_results(
        web_result,
        database_verification,
        visual_verification
    )

    print("\n=== AGENT 3 RESULT ===")
    print(agent3_result)