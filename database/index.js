const { Pool } = require("pg")
require("dotenv").config()

let pool

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  // For development: log all queries
  module.exports = {
    query: async (text, params) => {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (err) {
        console.error("Query error", err)
        throw err
      }
    },
  }
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Render
    },
  })

  module.exports = pool
}
