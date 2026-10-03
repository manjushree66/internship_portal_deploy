const Application = require("../models/Application");
const Faculty = require("../models/Faculty");
const Internship = require("../models/Internship");
const bcrypt = require("bcrypt");

const { sendFacultyCredentials } = require("../services/emailService");
const { generateApplicationsWorkbook } = require("../utils/excelExport");

// ============================================================
// GET ALL APPLICATIONS
// GET /api/admin/applications?status=review&search=ananya&page=1&limit=25
// ============================================================

exports.listApplications = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 25
        } = req.query;

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const filter = {};

        // Filter by verification status
        if (
            status &&
            ["approved", "review", "rejected", "pending"].includes(status)
        ) {
            filter["verification.status"] = status;
        }

        // Search by student name, SRN or company
        if (search && String(search).trim()) {
            const re = new RegExp(
                String(search).trim(),
                "i"
            );

            filter.$or = [
                { studentName: re },
                { srn: re },
                { company: re }
            ];
        }

        const applications = await Application.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Application.countDocuments(filter);

        res.json({
            success: true,
            applications,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber)
        });

    } catch (err) {
        console.error(
            "Failed to list applications:",
            err
        );

        res.status(500).json({
            success: false,
            error: "Failed to load applications."
        });
    }
};

// ============================================================
// GET SINGLE APPLICATION
// GET /api/admin/applications/:id
// ============================================================

exports.getApplication = async (req, res) => {
    try {
        const application =
            await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                error: "Application not found."
            });
        }

        res.json({
            success: true,
            application
        });

    } catch (err) {
        console.error(
            "Failed to get application:",
            err
        );

        res.status(500).json({
            success: false,
            error: "Failed to load application."
        });
    }
};

// ============================================================
// ADMIN OVERRIDE VERIFICATION DECISION
// PATCH /api/admin/applications/:id/override
// ============================================================

exports.overrideDecision = async (req, res) => {
    try {
        const {
            status,
            reason,
            overriddenBy
        } = req.body;

        if (
            !["approved", "review", "rejected"]
                .includes(status)
        ) {
            return res.status(400).json({
                success: false,
                error:
                    "status must be approved, review, or rejected."
            });
        }

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({
                success: false,
                error: "Override reason is required."
            });
        }

        const application =
            await Application.findByIdAndUpdate(
                req.params.id,
                {
                    "verification.adminOverride": {
                        status,
                        reason: String(reason).trim(),
                        overriddenBy:
                            overriddenBy || "Admin",
                        overriddenAt: new Date()
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!application) {
            return res.status(404).json({
                success: false,
                error: "Application not found."
            });
        }

        res.json({
            success: true,
            message:
                "Application decision overridden successfully.",
            application
        });

    } catch (err) {
        console.error(
            "Failed to override decision:",
            err
        );

        res.status(500).json({
            success: false,
            error:
                "Failed to override application decision."
        });
    }
};

// ============================================================
// GET ALL FACULTY
// GET /api/admin/faculty
// ============================================================

exports.getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty
            .find()
            .sort({ name: 1 });

        res.json({
            success: true,

            teachers: faculty.map((f) => ({
                id: f._id,
                name: f.name,
                email: f.email,
                department: f.department,
                role: f.role || "Regular Faculty"
            }))
        });

    } catch (err) {
        console.error(
            "Failed to get faculty:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Failed to load faculty."
        });
    }
};

// ============================================================
// CREATE FACULTY
// POST /api/admin/faculty/create
// ============================================================

exports.createFaculty = async (req, res) => {
    try {
        const {
            faculty_id,
            name,
            email,
            department
        } = req.body;

        if (!faculty_id || !name || !email) {
            return res.status(400).json({
                success: false,
                message:
                    "Faculty ID, name and email are required"
            });
        }

        const existingFaculty =
            await Faculty.findOne({
                $or: [
                    { faculty_id },
                    { email }
                ]
            });

        if (existingFaculty) {
            return res.status(409).json({
                success: false,
                message:
                    "Faculty with this ID or email already exists"
            });
        }

        const temporaryPassword =
            Math.random().toString(36).slice(-8) +
            Math.random().toString(10).slice(-2);

        const hashedPassword =
            await bcrypt.hash(
                temporaryPassword,
                12
            );

        const faculty =
            await Faculty.create({
                faculty_id,
                name,
                email,
                department:
                    department || "CSE",
                role: "Regular Faculty",
                password: hashedPassword
            });

        await sendFacultyCredentials({
            email: faculty.email,
            name: faculty.name,
            temporaryPassword
        });

        res.status(201).json({
            success: true,
            message:
                "Faculty created successfully and credentials sent by email",

            faculty: {
                id: faculty._id,
                faculty_id: faculty.faculty_id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                role: faculty.role
            }
        });

    } catch (error) {
        console.error(
            "Failed to create faculty:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// ASSIGN SCRUTINY FACULTY
// PATCH /api/admin/faculty/:id/scrutiny
// ============================================================

exports.assignScrutinyFaculty = async (req, res) => {
    try {
        const faculty =
            await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found."
            });
        }

        faculty.role = "Scrutiny Faculty";

        await faculty.save();

        res.json({
            success: true,
            message:
                "Faculty assigned as Scrutiny Faculty successfully.",

            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                role: faculty.role
            }
        });

    } catch (err) {
        console.error(
            "Failed to assign scrutiny faculty:",
            err
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to assign scrutiny faculty."
        });
    }
};

// ============================================================
// ASSIGN INTERNSHIP TO FACULTY
// PUT /api/admin/internship/:id/assign-faculty
// ============================================================

exports.assignInternshipFaculty = async (req, res) => {
    try {
        const { faculty_id } = req.body;

        if (!faculty_id) {
            return res.status(400).json({
                success: false,
                message: "Faculty ID is required"
            });
        }

        const faculty =
            await Faculty.findById(faculty_id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found"
            });
        }

        const internship =
            await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: "Internship not found"
            });
        }

        internship.assigned_faculty =
            faculty.email;

        await internship.save();

        res.status(200).json({
            success: true,
            message:
                "Internship assigned to faculty successfully",

            assignment: {
                internshipId:
                    internship._id,
                facultyId:
                    faculty._id,
                facultyName:
                    faculty.name,
                facultyEmail:
                    faculty.email
            }
        });

    } catch (error) {
        console.error(
            "Failed to assign internship:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// STUDENT OVERVIEW
// GET /api/admin/students
// ============================================================

exports.getStudentOverview = async (req, res) => {
    try {
        const applications =
            await Application
                .find()
                .sort({ createdAt: -1 });

        const students =
            applications.map((application) => {

                const finalStatus =
                    application.verification
                        ?.adminOverride
                        ?.status ||
                    application.verification
                        ?.status ||
                    "pending";

                return {
                    id: application._id,

                    name:
                        application.studentName ||
                        "-",

                    email:
                        application.studentEmail ||
                        "-",

                    srn:
                        application.srn ||
                        "-",

                    semester:
                        application.semester ||
                        "-",

                    company:
                        application.company ||
                        "-",

                    role:
                        application.role ||
                        "-",

                    startDate:
                        application.startDate ||
                        null,

                    endDate:
                        application.endDate ||
                        null,

                    internshipNature:
                        application.internshipNature ||
                        "-",

                    category:
                        application.category ||
                        "-",

                    status: finalStatus,

                    hardFails:
                        application.verification
                            ?.hardFails ||
                        [],

                    softFlags:
                        application.verification
                            ?.softFlags ||
                        [],

                    aiNotes:
                        application.verification
                            ?.aiNotes ||
                        "",

                    createdAt:
                        application.createdAt
                };
            });

        res.json({
            success: true,
            students
        });

    } catch (err) {
        console.error(
            "Failed to get student overview:",
            err
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load student overview."
        });
    }
};

// ============================================================
// EXPORT APPLICATIONS TO EXCEL
// GET /api/admin/applications/export
// ============================================================

exports.exportApplications = async (req, res) => {
    try {
        const applications =
            await Application
                .find()
                .sort({ createdAt: -1 });

        const workbook =
            await generateApplicationsWorkbook(
                applications
            );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=internship_verification_log.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (err) {
        console.error(
            "Excel export failed:",
            err
        );

        res.status(500).json({
            success: false,
            error:
                "Failed to generate the Excel export."
        });
    }
};

// ============================================================
// RELEASE GRADE
// PUT /api/admin/release-grade/:id
// ============================================================

exports.releaseGrade = async (req, res) => {
    try {
        const internship =
            await Internship.findById(
                req.params.id
            );

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: "Internship not found"
            });
        }

        if (!internship.grade) {
            return res.status(400).json({
                success: false,
                message:
                    "Grade has not been assigned yet"
            });
        }

        internship.grade_released = true;

        await internship.save();

        res.status(200).json({
            success: true,
            message:
                "Grade released successfully"
        });

    } catch (error) {
        console.error(
            "Failed to release grade:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};