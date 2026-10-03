require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const password = process.env.ADMIN_PASSWORD;

        if (!password) {
            throw new Error("ADMIN_PASSWORD is missing from .env");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await Admin.findOneAndUpdate(
            {},
            {
                email: process.env.EMAIL_USER,
                password: hashedPassword
            },
            {
                new: true
            }
        );

        console.log("Admin account updated successfully.");
        console.log("Admin email:", process.env.EMAIL_USER);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Failed:", error);
        process.exit(1);
    }
}

resetAdmin();