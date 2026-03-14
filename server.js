const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const path = require("path");

const express = require("express");
require("dotenv").config({ path: "./config.env" });

const globalErrorHandling = require("./middleware/globalErrorHandling");
const ApiError = require("./utils/apiError");

// routes
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

const dbConnection = require("./config/database");

const app = express();

const PORT = process.env.PORT || 8000;

dbConnection();

// middleware for understand json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// middleware for query string to translate price[gt] to price: { gt:  }
app.set("query parser", "extended");

//  serve on static files
app.use(express.static(path.join(__dirname, "uploads")));

// mount routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);

// * unhandled routes middleware (inside express)
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// * global error handler middleware [express] (outside express)
app.use(globalErrorHandling);

const server = app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// * Unhandled Rejection Error
process.on("unhandledRejection", (error) => {
  console.error("unhandledRejection", error);
  server.close(() => {
    console.log("program shut down...");
    process.exit(1);
  });
});
