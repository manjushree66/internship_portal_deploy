import API from "../services/api";
import { useState } from "react";
import "./InternshipForm.css";

// Helper function to calculate minimum internship duration (6 weeks)
// Uses local date methods to prevent UTC timezone offset issues
const addWeeks = (dateString, weeks) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setDate(date.getDate() + weeks * 7);
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  
  return `${yyyy}-${mm}-${dd}`;
};

export default function InternshipForm() {
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    srn: "",
    cgpa: "",
    semester: "",

    startDate: "",
    endDate: "",

    campus: "On Campus",

    company: "",
    companyWebsite: "", // <-- ADDED: Company Website
    role: "",
    managerLinkedIn: "",
    managerName: "",
    managerEmail: "",

    mentorName: "",
    mentorEmail: "",

    internshipNature: "Paid",

    category: "Industry",

    researchCenter: "",
    otherResearchCenter: "",

    stipend: "",

    offerLetter: null,
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "file" ? files[0] : value,
      };

      // Reset End Date if Start Date changes and is now invalid
      if (name === "startDate" && updated.endDate) {
        const minDate = addWeeks(value, 6);
        if (updated.endDate < minDate) {
          updated.endDate = "";
        }
      }

      return updated;
    });
  };

  // Submit Form
  const submit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("student_name", form.studentName);
      formData.append("student_email", form.studentEmail);
      formData.append("srn", form.srn);
      formData.append("cgpa", form.cgpa);
      formData.append("semester", form.semester);

      formData.append("campus_type", form.campus);

      formData.append("company", form.company);
      formData.append("company_website", form.companyWebsite); // <-- ADDED
      formData.append("role", form.role);

      formData.append("manager_name", form.managerName);
      formData.append("manager_email", form.managerEmail);

      formData.append("mentor_name", form.mentorName);
      formData.append("mentor_email", form.mentorEmail);

      formData.append("start_date", form.startDate);
      formData.append("end_date", form.endDate);

      formData.append("internship_nature", form.internshipNature);
      formData.append("internship_type", form.category);

      formData.append(
        "research_centre",
        form.researchCenter === "Other"
          ? form.otherResearchCenter
          : form.researchCenter
      );

      formData.append("stipend", form.stipend);

      if (form.offerLetter) {
        formData.append("offerLetter", form.offerLetter);
      }

      await API.post(
    "/student/register",
    formData,
    {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
);

      alert("Application Submitted Successfully!");

      // Reset form on success
      setForm({
        studentName: "",
        studentEmail: "",
        srn: "",
        cgpa: "",
        semester: "",
        startDate: "",
        endDate: "",
        duration: "",
        campus: "On Campus",
        company: "",
        companyWebsite: "", // <-- ADDED
        role: "",
        managerLinkedIn: "",
        managerName: "",
        managerEmail: "",
        mentorName: "",
        mentorEmail: "",
        internshipNature: "Paid",
        category: "Industry",
        researchCenter: "",
        otherResearchCenter: "",
        stipend: "",
        offerLetter: null,
      });
    } catch (err) {
      console.error(err);
      alert("Submission Failed!");
    }
  };

  const minEndDate = form.startDate ? addWeeks(form.startDate, 6) : "";

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Internship Registration
      </h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Student Details */}
        <div className="grid md:grid-cols-2 gap-5">
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={form.studentName}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="email"
            name="studentEmail"
            placeholder="Student Email"
            value={form.studentEmail}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <input
            type="text"
            name="srn"
            placeholder="Enter SRN"
            value={form.srn}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          >
            <option value="">Select Semester</option>
            <option value="4">Semester 4</option>
            <option value="6">Semester 6</option>
            <option value="8">Semester 8</option>
          </select>

          <input
            type="number"
            step="0.01"
            name="cgpa"
            placeholder="Enter your CGPA"
            value={form.cgpa}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />
        </div>

        {/* Dates section with 6-week constraint */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              required
            />
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
              End Date (Min 6 weeks)
            </label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              min={minEndDate} 
              disabled={!form.startDate} 
              className="border rounded-lg p-3 w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>
          <div className="text-sm text-gray-500">
          <input
            type="number"
            step="1"
            name="duration"
            placeholder="Enter the duration of the internship in weeks"
            value={form.duration}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full"
            required
          />
          </div>
        </div>
        

        {/* Campus Selection */}
        <select
          name="campus"
          value={form.campus}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full"
        >
          <option value="On Campus">On Campus</option>
          <option value="Off Campus">Off Campus</option>
        </select>

        {/* On Campus Details (Shows Mentor fields) */}
        {form.campus === "On Campus" && (
          <div className="grid md:grid-cols-2 gap-5">
            <input
              type="text"
              name="company"
              placeholder="Company / Institution Name"
              value={form.company}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            <input
              type="url"
              name="companyWebsite"
              placeholder="Company Website Link (e.g. https://...)"
              value={form.companyWebsite}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={handleChange}
              className="border rounded-lg p-3 md:col-span-2"
            />
            <input
              type="text"
              name="mentorName"
              placeholder="Mentor Name/Manager Name"
              value={form.mentorName}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            <input
              type="email"
              name="mentorEmail"
              placeholder="Mentor Email/Manager Email"
              value={form.mentorEmail}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            <input
             type="url"
            name="managerLinkedIn"
            placeholder="Manager LinkedIn Profile (https://linkedin.com/in/...)"
             value={form.managerLinkedIn}
            onChange={handleChange}
            className="border rounded-lg p-3 md:col-span-2"
           />
            
          </div>
        )}

        {/* Off Campus Details (Shows Company, Website, & Manager fields) */}
        {form.campus === "Off Campus" && (
          <div className="grid md:grid-cols-2 gap-5">
            <input
              type="text"
              name="company"
              placeholder="Company / Institution Name"
              value={form.company}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            {/* NEW FIELD: Company Website */}
            <input
              type="url"
              name="companyWebsite"
              placeholder="Company Website Link (e.g. https://...)"
              value={form.companyWebsite}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={handleChange}
              className="border rounded-lg p-3 md:col-span-2"
            />
            <input
              type="text"
              name="managerName"
              placeholder="Manager / Supervisor Name"
              value={form.managerName}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
            <input
              type="email"
              name="managerEmail"
              placeholder="Manager / Supervisor Email"
              value={form.managerEmail}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />
          </div>
        )}

        {/* Paid / Unpaid */}
        <select
          name="internshipNature"
          value={form.internshipNature}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full"
        >
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        {/* Stipend */}
        {form.internshipNature === "Paid" && (
          <input
            type="number"
            name="stipend"
            placeholder="Monthly Stipend Amount"
            value={form.stipend}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full"
          />
        )}

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full"
        >
          <option value="Industry">Industry</option>
          <option value="Research">Research</option>
        </select>

        {/* Research Center */}
        {form.category === "Research" && (
          <div className="grid md:grid-cols-2 gap-5">
            <select
              name="researchCenter"
              value={form.researchCenter}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              <option value="">Select Research Centre</option>
              <option value="CCBD">CCBD</option>
              <option value="ISFCR">ISFCR</option>
              <option value="CSDML">CSDML</option>
              <option value="PiLabs">Pi Labs</option>
              <option value="CHeal">CHeal</option>
              <option value="IOT">IOT</option>
              <option value="PVL Labs">PVL Labs</option>
              <option value="RAAS">RAAS</option>
              <option value="Other">Other</option>
            </select>

            {form.researchCenter === "Other" && (
              <input
                type="text"
                name="otherResearchCenter"
                placeholder="Enter Research Centre Name"
                value={form.otherResearchCenter}
                onChange={handleChange}
                className="border rounded-lg p-3 w-full"
              />
            )}
          </div>
        )}

        {/* Offer Letter Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Offer Letter (PDF)
          </label>
          <input
            type="file"
            name="offerLetter"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="border rounded-lg p-3 w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          {form.offerLetter && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✓ Selected: {form.offerLetter.name}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
