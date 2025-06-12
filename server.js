/******************************************
 * Primary server file for the application
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()

const staticRoutes = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const errorHandler = require("./middleware/errorHandler")

/* ***********************
 * Middleware & Layout Setup
 *************************/
app.use(expressLayouts)
app.set("view engine", "ejs")
app.set("layout", "./layouts/layout") // not at views root
app.use(express.static("public"))

/* ***********************
 * Inject nav into all views
 *************************/
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
    next()
  } catch (err) {
    next(err)
  }
})

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Catch-all 404 route (must be last before error handling)
app.use((req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
 * Error Handlers
 *************************/
app.use(errorHandler.notFound)
app.use(errorHandler.internalServerError)

/* ***********************
 * Final Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Server Info
 *************************/
// server.js

const port = 5500;
const host = 'localhost'; // Define the host

// ... your other app.use() and route configurations ...

app.listen(port, () => {
  // Change the console.log to include the full URL
  console.log(`App listening on http://${host}:${port}`);
});