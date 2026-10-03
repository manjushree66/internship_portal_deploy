const Internship = require("../models/Internship");
const Student = require("../models/Student");


// ===============================
// View All Applications
// ===============================
exports.viewApplications = async (req, res) => {
    try {

        const internships = await Internship.find({
           assigned_faculty: req.user.identifier
           }).sort({ createdAt: -1 });

        const applications = await Promise.all(
            internships.map(async (internship) => {

                const student = await Student.findOne({
                    srn: internship.srn
                });

                return {

                    id: internship._id,

                    name: internship.student_name,

                    srn: internship.srn,

                    sem: internship.semester,

                    status: internship.status === "Submitted"
                        ? "Pending Approval"
                        : internship.status,

                    registration: {

                        company: internship.company,

                        website: internship.company_website || "N/A",

                        role: internship.role,

                        type: internship.campus_type,

                        startDate: internship.start_date,

                        endDate: internship.end_date,

                        cgpa: student?.cgpa || "-",

                        stipend: internship.paid
                            ? `Paid (${internship.stipend})`
                            : "Unpaid",

                        offerLetter: internship.offer_letter
                            ? `http://localhost:5000/uploads/${internship.offer_letter}`
                            : null

                    }

                };

            })
        );

        res.status(200).json({

            success: true,

            students: applications

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// ===============================
// Approve Internship
// ===============================
exports.approveApplication = async (req, res) => {

    try {

        const internship = await Internship.findById(req.params.id);

        if (!internship) {

            return res.status(404).json({

                success: false,

                message: "Internship not found"

            });

        }

        internship.status = "Approved";
        internship.current_stage = "Manager Evaluation";
        internship.assigned_faculty = req.user.identifier;

        await internship.save();

        res.json({

            success: true,

            message: "Internship Approved Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// ===============================
// Reject Internship
// ===============================
exports.rejectApplication = async (req, res) => {

    try {

        const internship = await Internship.findById(req.params.id);

        if (!internship) {

            return res.status(404).json({

                success: false,

                message: "Internship not found"

            });

        }

        internship.status = "Rejected";
        internship.current_stage = "Faculty Approval";
        internship.faculty_remarks = req.body.reason;
        internship.assigned_faculty = req.user.identifier;
        await internship.save();

        res.json({

            success: true,

            message: "Internship Rejected Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// ===============================
// Assign Grade & Credits
// ===============================
exports.assignGrade = async (req, res) => {

    try {

        const {

            id,
            grade,
            credits

        } = req.body;

        const internship = await Internship.findById(id);

        if (!internship) {

            return res.status(404).json({

                success: false,

                message: "Internship not found"

            });

        }
        internship.grade = grade;
        internship.credits = credits;

        internship.status = "Completed";
        internship.current_stage = "Completed";
        internship.grade_released = false;
        await internship.save();

        res.json({

            success: true,

            message: "Internship Finalized Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};