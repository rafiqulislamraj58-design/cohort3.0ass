import app from "./app/app.js";
import { config } from "./config/config.js";
import { connectDb } from "./config/db.js";

const startServer = async () => {
  try {
    await connectDb();

    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();