const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

const { Pool } = require("pg"); // PostgreSQL client

const port = process.env.port || 3000;

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

app.get("/bye", async (req, res) => {
  // once authentication authorization done
  // req.user
  // if (req.user) {
  //   // business logic
  // }
  // console.log(req.params);
  try {
    // Get the request body
    const responseBody = req.body;

    // Get query parameters
    const queryParams = req.query;
    const result = await pool.query(
      "SELECT username FROM app_user WHERE username = 'ownerdoe'"
    );

    // Combine body and query params in the response
    res.json({
      body: responseBody,
      query: queryParams,
      sqlResult: result,
    });

    // res.json(result.rows);
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send("Error connecting to the database");
  }
});

// app.post("/bye", async (req, res) => {
//   console.log(await req.body);
//   res.status(200);
// });

// POST endpoint that echoes back the request body
app.post("/echo", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

// Set up a basic route
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
