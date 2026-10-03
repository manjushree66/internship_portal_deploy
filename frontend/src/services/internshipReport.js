import { apiRequest } from "./api";

// Get approval + report submission status
export const getInternshipReportStatus = async () => {
  return await apiRequest(
    "/student/internship-report",
    {
      method: "GET",
    }
  );
};

// Upload internship report
export const submitInternshipReport = async (file) => {
  const formData = new FormData();

  formData.append("report", file);

  return await apiRequest(
    "/student/internship-report",
    {
      method: "POST",
      body: formData,
    }
  );
};

// View submitted report
export const getSubmittedReport = async () => {
  const response = await fetch(
    "http://localhost:5000/api/student/internship-report/file",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch report.");
  }

  return await response.blob();
};aimport API from "./api";

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