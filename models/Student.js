const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    srn: {
        type: String,
        required: true,
        unique: true
    },

    student_name: {
        type: String,
        required: true
    },

    student_email: {
        type: String
    },

    phone: {
        type: String
    },

    branch: {
        type: String
    },

    semester: {
        type: String
    },

    section: {
        type: String
    },

    cgpa: {
        type: Number
    },

    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model(
    "Student",
    studentSchema,
    "student"
);