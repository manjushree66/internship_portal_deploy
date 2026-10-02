import dns.resolver


def check_mx(domain):

    result = {
        "mx_exists": False,
        "mx_records": []
    }

    try:
        answers = dns.resolver.resolve(domain, "MX")

        result["mx_exists"] = True

        result["mx_records"] = [
            answer.exchange.to_text()
            for answer in answers
        ]

    except Exception:
        result["mx_exists"] = False

    return result


if __name__ == "__main__":

    test_domain = "example.com"

    result = check_mx(test_domain)

    print(result)