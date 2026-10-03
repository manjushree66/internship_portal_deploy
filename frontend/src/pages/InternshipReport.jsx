import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaFilePdf,
  FaUpload,
  FaEye,
  FaArrowLeft,
} from "react-icons/fa";

import {
  getInternshipReportStatus,
  submitInternshipReport,
  getSubmittedReport,
} from "../services/internshipReport";

import "./InternshipReport.css";

const InternshipReport = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Check internship approval and report status
  useEffect(() => {
    const loadReportStatus = async () => {
      try {
        setLoading(true);

        const data = await getInternshipReportStatus();

        setApproved(data.approved);
        setReportSubmitted(data.reportSubmitted);
        setSubmittedAt(data.submittedAt || null);
      } catch (err) {
        console.error(err);
        setError("Unable to load internship report status.");
      } finally {
        setLoading(false);
      }
    };

    loadReportStatus();
  }, []);

  const handleFileChange = (e) => {
    setError("");
    setMessage("");

    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Only PDF
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select your internship report PDF.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      await submitInternshipReport(selectedFile);

      setReportSubmitted(true);
      setSubmittedAt(new Date().toISOString());
      setSelectedFile(null);

      setMessage("Internship report submitted successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to submit internship report."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleViewReport = async () => {
    try {
      const blob = await getSubmittedReport();

      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      setError("Unable to open submitted report.");
    }
  };

  if (loading) {
    return (
      <div className="internship-report-page">
        <div className="report-loading">
          Loading internship report...
        </div>
      </div>
    );
  }

  return (
    <div className="internship-report-page">

      {/* Header */}
      <div className="report-header">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Back
        </button>

        <h1>INTERNSHIP REPORT</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="report-message error">
          {error}
        </div>
      )}

      {/* Success */}
      {message && (
        <div className="report-message success">
          {message}
        </div>
      )}

      {/* NOT APPROVED */}
      {!approved && (
        <div className="report-card">

          <div className="report-icon pending">
            <FaFilePdf />
          </div>

          <h2>Internship Report Submission</h2>

          <p>
            Your internship has not been approved by the
            faculty yet.
          </p>

          <p className="secondary-text">
            You can submit your internship report once your
            internship is approved.
          </p>

        </div>
      )}

      {/* APPROVED */}
      {approved && (
        <>
          <div className="report-card">

            <div className="report-icon approved">
              <FaCheckCircle />
            </div>

            <h2>Internship Approved</h2>

            <p>
              Your internship has been approved by the faculty.
            </p>

            <p className="secondary-text">
              Please prepare and submit your internship report
              based on the internship details available on your
              Dashboard.
            </p>

            <button
              className="dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </button>

          </div>

          {/* REPORT ALREADY SUBMITTED */}
          {reportSubmitted ? (
            <div className="report-card status-card">

              <h2>Report Status</h2>

              <div className="submitted-status">
                <FaCheckCircle />
                <span>Internship Report Submitted</span>
              </div>

              {submittedAt && (
                <p className="submitted-date">
                  Submitted on:{" "}
                  {new Date(submittedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              )}

              <button
                className="view-report-button"
                onClick={handleViewReport}
              >
                <FaEye />
                View Submitted Report
              </button>

            </div>
          ) : (
            /* REPORT UPLOAD */
            <div className="report-card">

              <h2>Internship Report Submission</h2>

              <p className="secondary-text">
                Upload your completed internship report in PDF
                format.
              </p>

              <div className="upload-section">

                <label className="upload-label">
                  Final Internship Report
                </label>

                <label className="file-upload-box">
                  <FaUpload />

                  <span>
                    {selectedFile
                      ? selectedFile.name
                      : "Choose PDF"}
                  </span>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </label>

                <p className="file-hint">
                  PDF only • Maximum 10 MB
                </p>

              </div>

              <button
                className="submit-report-button"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading
                  ? "Submitting..."
                  : "Submit Report"}
              </button>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InternshipReport;