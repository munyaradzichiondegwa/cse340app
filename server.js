/******************************************
 * Primary server file for the application
 ******************************************/

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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

// App Initialization
const app = express();
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

// View Engine & Static Files
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session & Flash Config
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
  })
);
app.use(flash());

// Express-messages setup
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Inject navigation bar into all views
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

// JWT middleware after session and cookie parsing
app.use(utilities.checkJWTToken);

// Route Definitions
app.use(staticRoutes);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.get("/", baseController.buildHome);

// 404 Handler
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`Error at "${req.originalUrl}": ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const message = err.status === 404 ? err.message : "Oops! Something went wrong.";

  // Use nav from res.locals if available to avoid extra DB call
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav: res.locals.nav || '',
  });
});

// Start Server
console.log("Environment:", process.env.NODE_ENV || "development");
console.log(
  "DB URL:",
  process.env.DATABASE_URL ? process.env.DATABASE_URL.split("@")[0] + "@..." : "Not defined"
);
app.listen(port, () => {
  console.log(`✔ App listening at http://${host}:${port}`);
});
