import mongoose from "mongoose";

export const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to database successfully.");
  } catch (error) {
    console.log("Database connection failed.");
    process.exit(1);
  }
};
