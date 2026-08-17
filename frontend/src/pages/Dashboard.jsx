import { useState, useEffect } from "react";

import './Dashboard.css'

// Change this to your backend's actual endpoint
const API_URL = "http://localhost:5000/api/dashboard";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {

  setLoading(true);
  setError("");

  try {

    // Get logged in user
    const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  throw new Error("Please login again.");
}

const token = localStorage.getItem("authToken");

const response = await fetch(
  `${API_URL}?srn=${user.srn}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
    

    

    if (!response.ok) {
      throw new Error("Unable to load dashboard data.");
    }

    const result = await response.json();

    setData(result);

  } catch (err) {

    console.error(err);
    setError(err.message || "Something went wrong while loading the dashboard.");

  } finally {

    setLoading(false);

  }

};

  return (
    <>
      

      <div className="p-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome{data?.studentName ? `, ${data.studentName}` : " Student"}
        </h2>

        {/* Loading state */}
        {loading && (
          <p className="mt-8 text-gray-500">Loading your dashboard...</p>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchDashboard}
              className="text-sm font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metric Cards Row */}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            <div className="bg-green-50 border border-green-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-green-700 tracking-wide uppercase">
                Status
              </h3>
              <p className="text-2xl font-bold text-green-950 mt-1">
                {data.status || "—"}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-yellow-700 tracking-wide uppercase">
                Company
              </h3>
              <p className="text-2xl font-bold text-yellow-950 mt-1">
                {data.company || "—"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
                Role
              </h3>
              <p className="text-2xl font-bold text-blue-950 mt-1">
                {data.role || "—"}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-red-700 tracking-wide uppercase">
                Notifications
              </h3>
              <p className="text-2xl font-bold text-red-950 mt-1">
                {data.notifications ?? 0}
              </p>
            </div>
          </div>
        )}

        {/* Student Internship Guidelines Section */}
        <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">
            🎓 PESU CSE Internship Guidelines Quick-Guide
          </h3>

          <div className="grid md:grid-cols-2 gap-8 mt-6">
            {/* Left Column: Timeline & Credits */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-blue-800 text-lg mb-2">
                  📅 Valid Internship Slots
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                  <li><strong>Slot 1:</strong> June – July 2026 (Summer)</li>
                  <li><strong>Slot 2:</strong> June – July 2027 (Summer)</li>
                  <li><strong>Slot 3:</strong> 8th Semester (Must finish before calendar deadline)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-blue-800 text-lg mb-2">
                  🪙 Credits & Duration Rule
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-950">
                  <p className="font-semibold">⏱️ 2 Weeks of Full-Time Work = 1 Academic Credit</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li><strong>Summer Track:</strong> Maximum of 2 credits can be earned.</li>
                    <li><strong>8th Semester:</strong> Remainder of 6 credits (or full 8 credits if no summer slot claimed).</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-blue-800 text-lg mb-2">
                  💼 Summer Restrictions
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                  <li>Industry internships <strong>must be paid</strong> to earn academic credit.</li>
                  <li>Unpaid stints allowed <em>only</em> at Tier-1 Research Institutes (IISc, IITs, NITs, IIITs, Central Govt).</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Approval & Evaluations */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-orange-800 text-lg mb-2">
                  ⚠️ Mandatory Approvals
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Departmental approval is strictly required before starting for:
                </p>
                <div className="flex gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-md font-medium">
                    All Off-Campus
                  </span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-md font-medium">
                    Unpaid On-Campus
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-purple-800 text-lg mb-2">
                  🛑 Evaluation Workflows
                </h4>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-purple-950">
                  <p className="font-semibold text-red-600">🚨 Critical Email Rule:</p>
                  <p className="text-gray-700 mt-1">
                    Your company Manager/HR must submit your evaluation form using
                    their <strong>official corporate email domain only</strong>.
                    Submissions from personal accounts (e.g., @gmail.com) will be
                    rejected automatically.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">
                  📄 Need an NOC?
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-gray-600 text-sm">
                  <li>Write a physical request letter indicating the company details & start/end dates.</li>
                  <li>Get the <strong>CSE Chairperson's physical signature</strong>.</li>
                  <li>Hand-deliver it to the <strong>Ground Floor, CSE Office</strong>.</li>
                  <li><em>Note: Email requests for NOCs are completely ignored.</em></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
            {/* Internship Report Section */}
<diiv className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
  <div className="flex items-start gap-4">

    {/* Icon */}
    <div className="bg-blue-100 text-blue-700 rounded-xl p-3 text-2xl">
      📄
    </div>

    <div className="flex-1">

      <h3 className="text-2xl font-bold text-gray-900">
        Internship Report
      </h3>

      <p className="text-gray-600 mt-3 leading-relaxed">
        As part of the internship completion procedure, students are required
        to upload their Internship Report upon completion of the internship.
      </p>

      <p className="text-gray-600 mt-2 leading-relaxed">
        The report format and submission link will be communicated via email.
      </p>

      {/* Report Format */}
      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">

        <h4 className="font-semibold text-blue-900 text-lg">
          📑 Internship Report Format
        </h4>

        <p className="text-sm text-blue-800 mt-2">
          Access the official internship report format using the link below.
        </p>

        <a
          href="https://drive.google.com/drive/folders/1xzZz-lnhVzchHb_NZSyiD-IV5g6tmgGf?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-4 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
        >
          📂 View Report Format
        </a>

      </div>

      {/* Submission Information */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">

        <p className="text-sm text-yellow-900">
          <strong>⚠️ Submission:</strong> The internship report submission
          link will be shared with students via their registered email.
        </p>

      </div>

    </div>

  </div>

</div>
    </>
  );
}
