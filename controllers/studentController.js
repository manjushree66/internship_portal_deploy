const Internship = require("../models/Internship");
const Student = require("../models/Student");
const fs = require("fs");

// ============================================================
// REGISTER INTERNSHIP
// POST /api/student/register
// ============================================================

exports.registerInternship = async (req, res) => {
    try {
        const data = {
            ...req.body
        };

        // Always take SRN from authenticated user
        data.srn = req.user.srn;

        // ======================================================
        // VALIDATE DATES
        // ======================================================

        if (!data.start_date || !data.end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            });
        }

        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);

        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid internship dates"
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        // ======================================================
        // CALCULATE INTERNSHIP DURATION
        // Minimum 6 weeks
        // ======================================================

        const durationWeeks =
            (endDate - startDate) /
            (1000 * 60 * 60 * 24 * 7);

        if (durationWeeks < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Internship duration must be at least 6 weeks"
            });
        }

        data.duration = Math.floor(durationWeeks);

        // ======================================================
        // OFFER LETTER UPLOAD
        // ======================================================

        if (req.file) {
            data.offer_letter = req.file.filename;
        }

        // ======================================================
        // ON-CAMPUS MENTOR -> MANAGER
        // ======================================================

        if (data.campus_type === "On Campus") {
            data.manager_name = data.mentor_name;
            data.manager_email = data.mentor_email;
        }

        // ======================================================
        // AUTOMATIC EVALUATION MODE
        // ======================================================

        if (
            data.company_evaluation === true ||
            data.company_evaluation === "true"
        ) {
            data.evaluation_mode = "Company";
        } else {
            data.evaluation_mode = "PES";
        }

        // ======================================================
        // AUTOMATIC APPROVAL LOGIC
        // ======================================================

        const exemptInstitutions = [
            "IIT",
            "NIT",
            "IISC",
            "IIIT"
        ];

        const company =
            (data.company || "").toUpperCase();

        const campusType =
            (data.campus_type || "").toLowerCase();

        const internshipNature =
            (data.internship_nature || "").toLowerCase();

        const isExempt =
            exemptInstitutions.some(
                (inst) => company.includes(inst)
            );

        if (isExempt) {
            data.status = "Approved";

        } else if (campusType === "off campus") {
            data.status = "Pending Approval";

        } else if (
            campusType === "on campus" &&
            internshipNature === "unpaid"
        ) {
            data.status = "Pending Approval";

        } else {
            data.status = "Approved";
        }

        // ======================================================
        // INITIAL WORKFLOW STAGE
        // ======================================================

        data.current_stage = "Scrutiny Verification";

        // ======================================================
        // CREATE NEW INTERNSHIP
        //
        // IMPORTANT:
        // Do NOT use findOneAndUpdate({ srn })
        // because one student can have multiple internships.
        // ======================================================

        const internship =
            await Internship.create(data);

        res.status(201).json({
            success: true,
            message:
                "Internship Registered Successfully",
            internship
        });

    } catch (error) {
        console.error(
            "Register Internship Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// TRACK INTERNSHIP STATUS
// GET /api/student/status/:srn
// ============================================================

exports.trackStatus = async (req, res) => {
    try {
        // Never trust SRN from URL.
        // Use authenticated student's SRN.
        const internship =
            await Internship.findOne({
                srn: req.user.srn
            }).sort({ createdAt: -1 });

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: "Internship not found"
            });
        }

        // ======================================================
        // CALCULATE PROGRESS
        // ======================================================

        let progress = 0;

        switch (internship.current_stage) {
            case "Submitted":
                progress = 20;
                break;

            case "Scrutiny Verification":
                progress = 40;
                break;

            case "Faculty Approval":
                progress = 60;
                break;

            case "Manager Evaluation":
                progress = 80;
                break;

            case "Completed":
                progress = 100;
                break;

            default:
                progress = 0;
        }

        res.status(200).json({
            success: true,

            data: {
                status: internship.status,

                stage:
                    internship.current_stage,

                progress,

                scrutinyRemarks:
                    internship.scrutiny_remarks,

                facultyRemarks:
                    internship.faculty_remarks,

                // Grade is hidden until released by COE/Admin
                grade: internship.grade_released
                    ? internship.grade
                    : null,

                // Credits remain visible
                credits:
                    internship.credits,

                evaluationMode:
                    internship.evaluation_mode,

                company:
                    internship.company,

                role:
                    internship.role,

                startDate:
                    internship.start_date,

                endDate:
                    internship.end_date,

                offerLetter:
                    internship.offer_letter
                        ? `http://localhost:5000/uploads/${internship.offer_letter}`
                        : null
            }
        });

    } catch (error) {
        console.error(
            "Track Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// GET INTERNSHIP REPORT STATUS
// GET /api/student/internship-report
// ============================================================

exports.getInternshipReportStatus = async (
    req,
    res
) => {
    try {
        // Get authenticated student's SRN
        const srn = req.user.srn;

        const internship =
            await Internship.findOne({
                srn
            }).sort({ createdAt: -1 });

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: "Internship not found"
            });
        }

        // Faculty approval controls report eligibility
        const approved =
            internship.status === "Approved";

        // Check report submission
        const reportSubmitted =
            internship.report &&
            internship.report.status === "Submitted";

        res.status(200).json({
            success: true,

            approved,

            reportSubmitted:
                !!reportSubmitted,

            submittedAt:
                internship.report?.submittedAt ||
                null
        });

    } catch (error) {
        console.error(
            "Get Internship Report Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// SUBMIT INTERNSHIP REPORT
// POST /api/student/internship-report
// ============================================================
//
// PDF is temporarily uploaded using Multer,
// converted to Buffer,
// then stored directly inside MongoDB.
// ============================================================

exports.submitInternshipReport = async (
    req,
    res
) => {
    try {
        // ======================================================
        // CHECK UPLOADED FILE
        // ======================================================

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload your internship report PDF."
            });
        }

        // ======================================================
        // GET AUTHENTICATED STUDENT SRN
        // ======================================================

        const srn = req.user.srn;

        // ======================================================
        // FIND INTERNSHIP
        // ======================================================

        const internship =
            await Internship.findOne({
                srn
            }).sort({ createdAt: -1 });

        if (!internship) {
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({
                success: false,
                message: "Internship not found."
            });
        }

        // ======================================================
        // CHECK FACULTY APPROVAL
        // ======================================================

        if (internship.status !== "Approved") {
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(403).json({
                success: false,
                message:
                    "Your internship has not been approved by the faculty yet."
            });
        }

        // ======================================================
        // PREVENT DUPLICATE SUBMISSION
        // ======================================================

        if (
            internship.report &&
            internship.report.status === "Submitted"
        ) {
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message:
                    "Your internship report has already been submitted."
            });
        }

        // ======================================================
        // VERIFY PDF
        // ======================================================

        if (
            req.file.mimetype !==
            "application/pdf"
        ) {
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message:
                    "Only PDF files are allowed."
            });
        }

        // ======================================================
        // READ PDF FROM TEMPORARY STORAGE
        // ======================================================

        const pdfData =
            fs.readFileSync(req.file.path);

        // ======================================================
        // STORE REPORT IN MONGODB
        // ======================================================

        internship.report = {
            fileName:
                req.file.originalname,

            contentType:
                req.file.mimetype,

            data: pdfData,

            submittedAt:
                new Date(),

            status:
                "Submitted"
        };

        await internship.save();

        // ======================================================
        // DELETE TEMPORARY FILE
        // ======================================================

        if (
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {
            fs.unlinkSync(req.file.path);
        }

        // ======================================================
        // RESPONSE
        // ======================================================

        res.status(200).json({
            success: true,
            message:
                "Internship report submitted successfully.",

            submittedAt:
                internship.report.submittedAt
        });

    } catch (error) {
        console.error(
            "Submit Internship Report Error:",
            error
        );

        // Clean up temporary file
        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {
            try {
                fs.unlinkSync(
                    req.file.path
                );
            } catch (cleanupError) {
                console.error(
                    "File cleanup error:",
                    cleanupError
                );
            }
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// VIEW / DOWNLOAD SUBMITTED INTERNSHIP REPORT
// GET /api/student/internship-report/file
// ============================================================

exports.getInternshipReportFile = async (
    req,
    res
) => {
    try {
        const srn = req.user.srn;

        const internship =
            await Internship.findOne({
                srn
            }).sort({ createdAt: -1 });

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: "Internship not found."
            });
        }

        // Check report
        if (
            !internship.report ||
            internship.report.status !== "Submitted" ||
            !internship.report.data
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Internship report has not been submitted."
            });
        }

        // Send PDF to browser
        res.set({
            "Content-Type":
                internship.report.contentType ||
                "application/pdf",

            "Content-Disposition":
                `inline; filename="${internship.report.fileName}"`
        });

        res.send(
            internship.report.data
        );

    } catch (error) {
        console.error(
            "Get Internship Report File Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// GET STUDENT PROFILE
// GET /api/student/profile
// ============================================================

exports.getProfile = async (
    req,
    res
) => {
    try {
        const student =
            await Student.findOne({
                srn: req.user.srn
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found"
            });
        }

        res.json({
            name:
                student.student_name,

            srn:
                student.srn,

            branch:
                student.branch,

            semester:
                student.semester,

            email:
                student.student_email,

            phone:
                student.phone,

            cgpa:
                student.cgpa,

            section:
                student.section
        });

    } catch (err) {
        console.error(
            "Get Profile Error:",
            err
        );

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ============================================================
// UPDATE STUDENT PROFILE
// PUT /api/student/profile
// ============================================================

exports.updateProfile = async (
    req,
    res
) => {
    try {
        const student =
            await Student.findOne({
                srn: req.user.srn
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found"
            });
        }

        // Update only fields allowed from profile page
        if (
            req.body.email !== undefined
        ) {
            student.student_email =
                req.body.email;
        }

        if (
            req.body.phone !== undefined
        ) {
            student.phone =
                req.body.phone;
        }

        await student.save();

        res.json({
            name:
                student.student_name,

            srn:
                student.srn,

            branch:
                student.branch,

            semester:
                student.semester,

            email:
                student.student_email,

            phone:
                student.phone,

            cgpa:
                student.cgpa,

            section:
                student.section
        });

    } catch (err) {
        console.error(
            "Update Profile Error:",
            err
        );

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};