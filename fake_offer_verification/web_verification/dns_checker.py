import dns.resolver


def check_dns(domain):

    result = {
        "dns_resolves": False,
        "a_records": []
    }

    try:
        answers = dns.resolver.resolve(domain, "A")

        result["dns_resolves"] = True

        result["a_records"] = [
            answer.to_text()
            for answer in answers
        ]

    except Exception:
        result["dns_resolves"] = False

    return result


if __name__ == "__main__":

    test_domain = "example.com"

    result = check_dns(test_domain)

    print(result)