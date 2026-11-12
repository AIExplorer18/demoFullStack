const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

// CORS: FRONTEND_URL can hold one or more URLs, separated by commas.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, "")) // remove trailing slashes
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("CORS blocked origin:", origin, "| allowed:", allowedOrigins);
      callback(null, false);
    },
  })
);

// Log every request that reaches the backend
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---- Optional database (Neon Postgres). Used only if DATABASE_URL exists ----
let sql = null;
if (process.env.DATABASE_URL) {
  const { neon } = require("@neondatabase/serverless");
  sql = neon(process.env.DATABASE_URL);
  console.log("Database: DATABASE_URL found, using Neon");
} else {
  console.log("Database: no DATABASE_URL, using memory mode");
}

// Fallback when there is no database (resets often on serverless!)
let memoryCount = 0;

async function getTotal() {
  if (!sql) return memoryCount;
  const rows = await sql`SELECT COUNT(*)::int AS total FROM clicks`;
  return rows[0].total;
}

// Health check: open backend URL in browser to test
app.get("/", (req, res) => {
  console.log("Health check route hit");
  res.json({ status: "Backend is running", database: sql ? "connected" : "none (memory mode)" });
});

// Simple GET endpoint
app.get("/hello", (req, res) => {
  console.log("/hello route hit");
  res.json({ message: "Hello from the backend!", time: new Date().toISOString() });
});

// Called when the button is clicked
app.post("/click", async (req, res) => {
  console.log("A. /click route hit");
  try {
    if (sql) {
      console.log("B. Using database");
      await sql`CREATE TABLE IF NOT EXISTS clicks (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())`;
      await sql`INSERT INTO clicks DEFAULT VALUES`;
    } else {
      memoryCount++;
      console.log("B. Using memory, count =", memoryCount);
    }
    const total = await getTotal();
    console.log("C. Sending response, total =", total);
    res.json({ message: "Click received by backend!", total });
  } catch (err) {
    console.error("ERROR in /click:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Run locally with: npm start (Vercel ignores this part)
if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
}

module.exports = app;