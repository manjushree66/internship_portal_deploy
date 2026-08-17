import json

from normalizer import normalize_text


def load_students(file_path):
    """
    Load student records from a JSON file.
    """

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def find_student(student_id, students):
    """
    Find a student using the student ID.
    """

    for student in students:

        if normalize_text(student.get("student_id")) == normalize_text(student_id):
            return student

    return None


def verify_student_company(student_id, extracted_company, students):
    """
    Check whether the company in the offer letter
    matches the company registered by the student.
    """

    student = find_student(student_id, students)

    if not student:
        return {
            "student_found": False,
            "company_match": False
        }

    registered_company = student.get("company_name")

    match = (
        normalize_text(registered_company)
        == normalize_text(extracted_company)
    )

    return {
        "student_found": True,
        "company_match": match,
        "registered_company": registered_company,
        "extracted_company": extracted_company
    }