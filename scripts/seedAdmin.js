// scripts/seedAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config({ path: ".env.local" });

const { MONGO_URI } = process.env;
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env.local");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password) {
      console.error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD");
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      process.exit(0);
    }

    await User.create({
      email,
      passwordHash: hash,
      isAdmin: true,
      createdAt: new Date(),
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
    process.exit(1);
  }
})();
