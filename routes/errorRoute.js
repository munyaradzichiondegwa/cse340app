// Add this route for testing purposes
router.get('/throw-error', (req, res, next) => {
throw new Error('Intentional server error for testing error handling.');
});