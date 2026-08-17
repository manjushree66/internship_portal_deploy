from db_verifier import (
    load_students,
    verify_student_company
)

from company_verifier import (
    load_companies,
    verify_company_details
)


STUDENT_FILE = "data/students.json"
COMPANY_FILE = "data/companies.xlsx"


# -----------------------------
# Example Agent 2 output
# -----------------------------

extracted_data = {
    "student_id": "PES001",
    "company_name": "ABC Technologies",
    "company_address": "Bangalore",
    "company_email": "hr@abc.com",
    "company_phone": "9876543210"
}


# -----------------------------
# Load databases
# -----------------------------

students = load_students(STUDENT_FILE)

companies = load_companies(COMPANY_FILE)


# -----------------------------
# Student DB verification
# -----------------------------

student_result = verify_student_company(
    extracted_data["student_id"],
    extracted_data["company_name"],
    students
)


# -----------------------------
# Company DB verification
# -----------------------------

company_result = verify_company_details(
    company_name=extracted_data["company_name"],
    address=extracted_data["company_address"],
    email=extracted_data["company_email"],
    phone=extracted_data["company_phone"],
    companies=companies
)


# -----------------------------
# Agent 3 database output
# -----------------------------

database_verification = {
    "student_verification": student_result,
    "company_verification": company_result
}


print("\nDATABASE VERIFICATION")
print("---------------------")

print(database_verification)