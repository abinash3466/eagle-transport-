const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

connectDB();

const app = express();

/* -----------------------------
   MIDDLEWARE
----------------------------- */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* -----------------------------
   STATIC FILES
----------------------------- */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

/* -----------------------------
   ROUTES IMPORT
----------------------------- */

const authRoutes = require("./routes/authRoutes");
const truckRoutes = require("./routes/truckRoutes");
const driverRoutes = require("./routes/driverRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const fuelLogRoutes = require("./routes/fuelLogRoutes");
const tollLogRoutes = require("./routes/tollLogRoutes");
const issueRoutes = require("./routes/issueRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

/* -----------------------------
   TEST ROUTE
----------------------------- */

app.get("/", (req, res) => {
  res.send("Eagle Transport Backend Running Successfully 🚚");
});

/* -----------------------------
   API ROUTES
----------------------------- */

app.use("/api/auth", authRoutes);

app.use("/api/trucks", truckRoutes);

app.use("/api/drivers", driverRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/fuel", fuelLogRoutes);

app.use("/api/toll", tollLogRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/expenses", expenseRoutes);

/* -----------------------------
   404 HANDLER
----------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

/* -----------------------------
   GLOBAL ERROR HANDLER
----------------------------- */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -----------------------------
   SERVER START
----------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});