const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
require("dotenv").config({ path: "./config.env" });

const globalErrorHandling = require("./middleware/globalErrorHandling");

const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");

const app = express();

const PORT = process.env.PORT || 8000;

dbConnection();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// * unhandled routes middleware (inside express)
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// * global error handler middleware [express] (outside express)
app.use(globalErrorHandling);

// * Unhandled Rejection Error
process.on("unhandledRejection", (error) => {
  console.error("unhandledRejection", error);
  server.close(() => {
    console.log("program shut down...");
    process.exit(1);
  });
});
