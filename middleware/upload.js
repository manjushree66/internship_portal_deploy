const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDir = path.join(__dirname, "..", "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


// ============================================================
// STORAGE CONFIGURATION
// ============================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDir);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9);

        const extension =
            path.extname(file.originalname).toLowerCase();

        cb(
            null,
            uniqueName + extension
        );

    }

});


// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {

    // Only PDF files
    if (file.mimetype === "application/pdf") {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only PDF files are allowed."
            ),
            false
        );

    }

};


// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        // Maximum file size = 10 MB
        fileSize: 10 * 1024 * 1024

    }

});


module.exports = upload;