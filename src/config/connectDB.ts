import chalk from "chalk";
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
    console.log(chalk.red("->connection error %s"), error.message);
  }

  const connection = mongoose.connection;

  if (connection.readyState >= 1) {
    console.log(chalk.green("-> Connected to DataBase"));
    return;
  }

  connection.on("connected", () => console.log(chalk.green("-> Connected to DataBase")));

  connection.on("error", (err) => console.log(chalk.red("-> Connection error %s"), err.message));
};
export default connectDB;
