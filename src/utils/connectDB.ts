import log from "@libs/logger";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI!);
  } catch (error) {
    log.error(`DB Connection error : ${error.message} `);
  }

  const connection = mongoose.connection;

  if (connection.readyState >= 1) {
    log.info("Connected to DataBase");
    return;
  }

  connection.on("connected", () => log.info("Connected to DataBase"));

  connection.on("error", (error) => log.error(`DB Connection error : ${error.message} `));
};
export default connectDB;
