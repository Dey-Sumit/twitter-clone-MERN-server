import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI!, {
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (error) {
    console.log("connection error ", error.message);
  }

  const connection = mongoose.connection;

  if (connection.readyState >= 1) {
    console.log("Connected to database");
    return;
  }

  connection.on("connected", () => console.log("Connected to database"));

  connection.on("error", () => console.log("Database connection failed"));
};
export default connectDB;
//TODO change the DB connection URL
