require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
const Manager = require("./models/Manager");
const Admin = require("./models/Admin");

async function hashPasswords(Model, modelName) {

    const users = await Model.find({});

    let count = 0;

    for (const user of users) {

        // Already hashed → skip
        if (
            typeof user.password === "string" &&
            user.password.startsWith("$2b$")
        ) {
            continue;
        }

        const hashedPassword = await bcrypt.hash(
            user.password,
            12
        );

        user.password = hashedPassword;

        await user.save();

        count++;

        console.log(
            `${modelName}: hashed password for ${user.email || user.srn}`
        );
    }

    console.log(`${modelName}: ${count} password(s) migrated.`);
}


async function migrate() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

        await hashPasswords(Student, "Student");
        await hashPasswords(Faculty, "Faculty");
        await hashPasswords(Manager, "Manager");
        await hashPasswords(Admin, "Admin");

        console.log("Password migration completed.");

        await mongoose.disconnect();

    }

    catch (error) {

        console.error("Migration failed:", error);

        process.exit(1);

    }
}

migrate();