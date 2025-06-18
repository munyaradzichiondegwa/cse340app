/******************************************
 * Primary server file for the application
 ******************************************/

/* =======================================
 * Require Statements
 * ===================================== */
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");
// Cookie Parser is required to read cookies, essential for JWT authentication.
const cookieParser = require("cookie-parser");

// PostgreSQL session store for persistent sessions.
const pgSession = require("connect-pg-simple")(session);

// --- Routes ---
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventory");
const accountRoute = require("./routes/accountRoute");

// --- Controllers ---
const baseController = require("./controllers/baseController");

// --- Utilities ---
const utilities = require("./utilities/");

// --- Database ---
const pool = require("./database/");

/* =======================================
 * App Initialization
 * ===================================== */
const app = express();

/* =======================================
 * Server Info
 * ===================================== */
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* =======================================
 * View Engine & Static Files
 * ===================================== */
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* =======================================
 * Middleware Section
 * ===================================== */

// Body parser for handling form data.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie Parser Middleware - MUST come before the JWT check.
// This middleware parses the cookie header and populates req.cookies.
app.use(cookieParser());

// JWT Token Check Middleware - Applied globally to all routes.
// This will check for a valid JWT on every incoming request.
app.use(utilities.checkJWTToken);

// Session and Flash Message Setup.
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(flash());

// Custom middleware to make flash messages available in views.
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Custom middleware to inject navigation data into all responses.
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

/* =======================================
 * Route Definitions
 * ===================================== */
app.use(staticRoutes);
app.use("/inventory", inventoryRoute);
app.use("/account", accountRoute);

// Home Page Route
app.get("/", baseController.buildHome);

/* =======================================
 * 404 Catch-All Handler
 * ===================================== */
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* =======================================
 * Global Error Handler
 * ===================================== */
app.use(async (err, req, res, next) => {
  try {
    const nav = await utilities.getNav();
    console.error(`Error at "${req.originalUrl}": ${err.message}`);
    const message = err.status === 404 ? err.message : "Oops! Something went wrong.";
    res.status(err.status || 500).render("errors/error", {
      title: err.status || "Server Error",
      message,
      nav,
    });
  } catch (error) {
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "An unexpected error occurred.",
      nav: "",
    });
  }
});

/* =======================================
 * Start Server
 * ===================================== */
console.log("Environment:", process.env.NODE_ENV);
console.log(
  "DB URL:",
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.split("@")[0] + "@..."
    : "Not defined"
);

app.listen(port, () => {
  console.log(`✔ App listening at http://${host}:${port}`);
});