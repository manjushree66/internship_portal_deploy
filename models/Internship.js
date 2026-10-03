const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
    {

        // =====================================================
        // STUDENT INFORMATION
        // =====================================================

        srn: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        student_name: {
            type: String,
            trim: true
        },

        student_email: {
            type: String,
            trim: true
        },


        // =====================================================
        // INTERNSHIP INFORMATION
        // =====================================================

        company: {
            type: String,
            required: true,
            trim: true
        },

        role: {
            type: String,
            trim: true
        },

        campus_type: {
            type: String,
            enum: [
                "On Campus",
                "Off Campus"
            ]
        },

        internship_nature: {
            type: String,
            trim: true
        },

        start_date: {
            type: Date
        },

        end_date: {
            type: Date
        },


        // =====================================================
        // MENTOR / MANAGER INFORMATION
        // =====================================================

        mentor_name: {
            type: String,
            trim: true
        },

        mentor_email: {
            type: String,
            trim: true
        },

        manager_name: {
            type: String,
            trim: true
        },

        manager_email: {
            type: String,
            trim: true
        },


        // =====================================================
        // OFFER LETTER
        // =====================================================

        offer_letter: {
            type: String,
            default: null
        },


        // =====================================================
        // COMPANY EVALUATION
        // =====================================================

        company_evaluation: {
            type: Boolean,
            default: false
        },

        evaluation_mode: {
            type: String,
            enum: [
                "Company",
                "PES"
            ],
            default: "PES"
        },


        // =====================================================
        // INTERNSHIP APPROVAL STATUS
        // =====================================================

        status: {
            type: String,
            default: "Pending Approval"
        },


        // =====================================================
        // WORKFLOW STAGE
        // =====================================================

        current_stage: {
            type: String,
            default: "Submitted"
        },


        // =====================================================
        // SCRUTINY
        // =====================================================

        scrutiny_remarks: {
            type: String,
            default: ""
        },


        // =====================================================
        // FACULTY APPROVAL
        // =====================================================

        faculty_remarks: {
            type: String,
            default: ""
        },


        // =====================================================
        // EVALUATION
        // =====================================================

        grade: {
            type: String,
            default: null
        },

        credits: {
            type: Number,
            default: null
        },


        // =====================================================
        // INTERNSHIP REPORT
        // =====================================================
        //
        // The student's final internship report PDF
        // is stored directly inside MongoDB as a Buffer.
        //

        report: {

            // Original PDF filename
            fileName: {
                type: String,
                default: null
            },

            // Example:
            // application/pdf
            contentType: {
                type: String,
                default: null
            },

            // Actual PDF data
            data: {
                type: Buffer,
                default: null
            },

            // Date and time when student submitted report
            submittedAt: {
                type: Date,
                default: null
            },

            // Report submission status
            status: {
                type: String,

                enum: [
                    "Not Submitted",
                    "Submitted"
                ],

                default: "Not Submitted"
            }

        },


        // =====================================================
        // NOC
        // =====================================================

        noc_requested: {
            type: Boolean,
            default: false
        }

    },

    {
        timestamps: true
    }
);


// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model(
    "Internship",
    internshipSchema,
    "internship_records"
);