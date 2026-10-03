const Internship = require("../models/Internship");
const fs = require("fs");

// ============================================================
// REGISTER INTERNSHIP
// ============================================================

exports.registerInternship = async (req, res) => {
    try {

        const data = {
            ...req.body
        };

        // Offer letter upload
        if (req.file) {
            data.offer_letter = req.file.filename;
        }

        // On Campus mentor -> manager
        if (data.campus_type === "On Campus") {
            data.manager_name = data.mentor_name;
            data.manager_email = data.mentor_email;
        }

        // Automatically decide evaluation mode
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

        const company = (data.company || "").toUpperCase();

        const campusType =
            (data.campus_type || "").toLowerCase();

        const internshipNature =
            (data.internship_nature || "").toLowerCase();

        const isExempt = exemptInstitutions.some(
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

        // Initial workflow stage
        data.current_stage = "Scrutiny Verification";

        // ======================================================
        // SAVE / UPDATE INTERNSHIP
        // ======================================================

        const internship =
            await Internship.findOneAndUpdate(
                { srn: data.srn },
                data,
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

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
// ============================================================

exports.trackStatus = async (req, res) => {

    try {

        const internship =
            await Internship.findOne({
                srn: req.params.srn
            });

        if (!internship) {

            return res.status(404).json({

                success: false,

                message:
                    "Internship not found"

            });
        }

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

                status:
                    internship.status,

                stage:
                    internship.current_stage,

                progress:
                    progress,

                scrutinyRemarks:
                    internship.scrutiny_remarks,

                facultyRemarks:
                    internship.faculty_remarks,

                grade:
                    internship.grade,

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
// ============================================================
// Used by:
// GET /api/student/internship-report
//
// Returns:
// - Whether internship is approved
// - Whether report is already submitted
// - Submission date
// ============================================================

exports.getInternshipReportStatus = async (req, res) => {

    try {

        // Get SRN from authenticated student
        const srn = req.student.srn;

        const internship =
            await Internship.findOne({ srn });

        if (!internship) {

            return res.status(404).json({

                success: false,

                message:
                    "Internship not found"

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

            approved:
                approved,

            reportSubmitted:
                !!reportSubmitted,

            submittedAt:
                internship.report?.submittedAt || null

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
// ============================================================
// Used by:
// POST /api/student/internship-report
//
// PDF is temporarily uploaded using Multer,
// converted to Buffer,
// then stored directly inside MongoDB.
// ============================================================

exports.submitInternshipReport = async (req, res) => {

    try {

        // ------------------------------------------------------
        // Check uploaded file
        // ------------------------------------------------------

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload your internship report PDF."

            });
        }

        // ------------------------------------------------------
        // Get authenticated student's SRN
        // ------------------------------------------------------

        const srn = req.student.srn;

        // ------------------------------------------------------
        // Find internship
        // ------------------------------------------------------

        const internship =
            await Internship.findOne({ srn });

        if (!internship) {

            // Remove temporary file
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({

                success: false,

                message:
                    "Internship not found."

            });
        }

        // ------------------------------------------------------
        // Check faculty approval
        // ------------------------------------------------------

        if (internship.status !== "Approved") {

            // Remove temporary file
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

        // ------------------------------------------------------
        // Prevent duplicate submission
        // ------------------------------------------------------

        if (
            internship.report &&
            internship.report.status === "Submitted"
        ) {

            // Remove temporary file
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

        // ------------------------------------------------------
        // Verify PDF
        // ------------------------------------------------------

        if (req.file.mimetype !== "application/pdf") {

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

        // ------------------------------------------------------
        // Read PDF from temporary storage
        // ------------------------------------------------------

        const pdfData =
            fs.readFileSync(req.file.path);

        // ------------------------------------------------------
        // Store report in MongoDB
        // ------------------------------------------------------

        internship.report = {

            fileName:
                req.file.originalname,

            contentType:
                req.file.mimetype,

            data:
                pdfData,

            submittedAt:
                new Date(),

            status:
                "Submitted"

        };

        await internship.save();

        // ------------------------------------------------------
        // Delete temporary file
        // ------------------------------------------------------

        if (
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {
            fs.unlinkSync(req.file.path);
        }

        // ------------------------------------------------------
        // Response
        // ------------------------------------------------------

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
                fs.unlinkSync(req.file.path);
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
// ============================================================
// Used by:
// GET /api/student/internship-report/file
// ============================================================

exports.getInternshipReportFile = async (req, res) => {

    try {

        const srn = req.student.srn;

        const internship =
            await Internship.findOne({ srn });

        if (!internship) {

            return res.status(404).json({

                success: false,

                message:
                    "Internship not found."

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

        res.send(internship.report.data);

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
// REQUEST NOC
// ============================================================

exports.requestNOC = async (req, res) => {

    try {

        const { srn } = req.body;

        const internship =
            await Internship.findOne({ srn });

        if (!internship) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"

            });
        }

        internship.status =
            "NOC Requested";

        await internship.save();

        res.status(200).json({

            success: true,

            message:
                "NOC Request Submitted",

            internship

        });

    } catch (error) {

        console.error(
            "Request NOC Error:",
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
// ============================================================

exports.getProfile = async (req, res) => {

    try {

        const Student =
            require("../models/Student");

        const student =
            await Student.findOne({

                srn:
                    req.student.srn

            });

        if (!student) {

            return res.status(404).json({

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

            message:
                err.message

        });
    }
};


// ============================================================
// UPDATE STUDENT PROFILE
// ============================================================

exports.updateProfile = async (req, res) => {

    try {

        const Student =
            require("../models/Student");

        const student =
            await Student.findOne({

                srn:
                    req.student.srn

            });

        if (!student) {

            return res.status(404).json({

                message:
                    "Student not found"

            });
        }

        student.student_email =
            req.body.email;

        student.phone =
            req.body.phone;

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

            message:
                err.message

        });
    }
};