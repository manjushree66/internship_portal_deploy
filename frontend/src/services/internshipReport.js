import API from "./api";

// Get internship approval status and report submission status
export const getInternshipReportStatus = async () => {
  const response = await API.get("/student/internship-report");

  return response.data;
};

// Submit internship report PDF
export const submitInternshipReport = async (file) => {
  const formData = new FormData();

  formData.append("report", file);

  const response = await API.post(
    "/student/internship-report",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// View submitted internship report
export const getSubmittedReport = async () => {
  const response = await API.get(
    "/student/internship-report/file",
    {
      responseType: "blob",
    }
  );

  return response.data;
};