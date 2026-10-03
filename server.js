const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// ============================================================
// IMPORT ROUTES
// ============================================================

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const managerRoutes = require("./routes/managerRoutes");
const applicationRoutes = require("./routes/applications");

// ============================================================
// CREATE EXPRESS APP
// ============================================================

const app = express();

// ============================================================
// CONNECT MONGODB
// ============================================================

connectDB();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// ============================================================
// API ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/student",
    studentRoutes
);

app.use(
    "/api/faculty",
    facultyRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/chat",
    chatRoutes
);

app.use(
    "/api/manager",
    managerRoutes
);

app.use(
    "/api/applications",
    applicationRoutes
);

// ============================================================
// DEFAULT ROUTE
// ============================================================

app.get("/", (req, res) => {

    res.send(
        "Internship Management Backend Running!"
    );

});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    // Multer file upload error
    if (err.name === "MulterError") {

        if (err.code === "LIMIT_FILE_SIZE") {

            return res.status(400).json({

                success: false,

                message:
                    "File size must be less than 10 MB."

            });

        }

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

    // PDF validation error
    if (
        err.message &&
        err.message.includes(
            "Only PDF files are allowed"
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Only PDF files are allowed."

        });

    }

    res.status(500).json({

        success: false,

        message:
            "Internal server error."

    });

});

// ============================================================
// START SERVER
// ============================================================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});