/******************************************
 * Primary server file for the application
 ******************************************/

const express = require("express");
const expressLayouts = require("express-ejs-layouts"); // Ensure this is required
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const pgSession = require("connect-pg-simple")(session);

// --- Routes ---
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const reviewRoute = require("./routes/reviewRoute"); 
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
app.use(expressLayouts); // This line is crucial and correctly placed
app.set("layout", "./layouts/layout"); // This line sets the default layout file

// Middleware for parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session & Flash Configuration
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

// ** Express messages middleware (after flash) **
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// ** Inject nav bar into all views (before routes) **
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

// ** JWT Auth Middleware ** (Applies universally to check and attach JWT data to res.locals)
app.use(utilities.checkJWTToken);

// Routes (after all middleware)
app.use(staticRoutes);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/review", reviewRoute);
app.get("/", baseController.buildHome);

// 404 Handler (must be after routes)
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

// Global Error Handler (last middleware)
app.use((err, req, res, next) => {
  console.error(`Error at "${req.originalUrl}": ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const message = err.status === 404 ? err.message : "Oops! Something went wrong.";

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav: res.locals.nav || "",
  });
});

// Server Startup
console.log("Environment:", process.env.NODE_ENV || "development");
console.log(
  "DB URL:",
  process.env.DATABASE_URL ? process.env.DATABASE_URL.split("@")[0] + "@..." : "Not defined"
);
app.listen(port, () => {
  console.log(`✔ App listening at http://${host}:${port}`);
});