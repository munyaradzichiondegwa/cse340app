// Add this route for testing errors
router.get("/trigger-error", (req, res, next) => {
    // Simulate a database connection failure
    const dbError = new Error("Database connection failed");
    dbError.status = 503;
    next(dbError);
});
  