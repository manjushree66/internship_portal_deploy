const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/internship_db";

const collections = ["student", "faculty", "manager", "admin"];

async function hashPasswords() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);

      const users = await collection.find({ password: { $exists: true } }).toArray();

      console.log(`\n📂 ${collectionName}: ${users.length} users found`);

      let hashedCount = 0;
      let skippedCount = 0;

      for (const user of users) {
        const password = user.password;

        // Skip passwords that are already bcrypt hashes
        if (
          typeof password === "string" &&
          password.startsWith("$2")
        ) {
          skippedCount++;
          continue;
        }

        if (typeof password !== "string" || password.length === 0) {
          console.log(`⚠️ Skipping user ${user._id}: invalid password`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await collection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        hashedCount++;
      }

      console.log(`🔐 Hashed: ${hashedCount}`);
      console.log(`⏭️ Already hashed/skipped: ${skippedCount}`);
    }

    console.log("\n✅ Password migration completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB connection closed");
  }
}

hashPasswords();