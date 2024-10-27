const express = require('express');
const app = express();
require('dotenv').config();
app.use(express.json());

const { Pool } = require('pg'); // PostgreSQL client

const port = process.env.PORT || 3000;

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

// GET endpoint to see if customer exists. Requires query param tax_id
app.get('/customer', async (req, res) => {
  try {
    const taxId = req.query.tax_id;

    // Check if tax_id is provided
    if (!taxId) {
      return res.status(400).send('Error: tax_id query parameter is required.');
    }

    const query = `SELECT tax_id FROM customer WHERE tax_id = $1`;
    const values = [taxId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send('No customer found with the provided tax_id');
    }
    const dbTaxId = result.rows[0].tax_id;

    res.status(200).json({
      tax_id: dbTaxId,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  }
});

// POST endpoint to create a new customer and associated records
app.post('/customer', async (req, res) => {
  const {
    tax_id, // Added tax_id to body
    phone_number,
    first_name,
    last_name,
    street,
    city,
    state,
    postal_code,
    business_name,
    title,
    customer_type,
    email,
  } = req.body;

  // Validate required fields
  if (
    !phone_number ||
    !first_name ||
    !last_name ||
    !street ||
    !city ||
    !state ||
    !postal_code ||
    !customer_type ||
    !tax_id
  ) {
    return res
      .status(400)
      .send('Error: All fields except business_name and title are required.');
  }

  // Validate customer_type
  if (!['i', 'b'].includes(customer_type)) {
    return res
      .status(400)
      .send("Error: customer_type must be either 'i' or 'b'.");
  }

  // If customer_type is 'i', reject business_name and title
  if (customer_type === 'i' && (business_name || title)) {
    return res
      .status(400)
      .send(
        'Error: business_name and title cannot be provided for individual customers.'
      );
  }
  // Validate phone_number to ensure it is exactly 10 digits and contains no dashes
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone_number)) {
    return res
      .status(400)
      .send('Error: phone_number must be 10 digits long without dashes.');
  }
  // TODO: validate other fields

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // Insert into the customer table
    const customerQuery = `
            INSERT INTO customer (tax_id, street, city, state, postal_code, customer_type, email, phone_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING tax_id`;

    const customerValues = [
      tax_id,
      street,
      city,
      state,
      postal_code,
      customer_type,
      email,
      phone_number,
    ];

    const customerResult = await client.query(customerQuery, customerValues);
    const newTaxId = customerResult.rows[0].tax_id; // Get the new customer's tax_id

    // Insert into individual or business table based on customer_type
    if (customer_type === 'i') {
      // Insert into individual table
      const individualQuery = `
                INSERT INTO individual (ssn, first_name, last_name, customer_type)
                VALUES ($1, $2, $3, $4)`;
      await client.query(individualQuery, [
        tax_id,
        first_name,
        last_name,
        customer_type,
      ]);
    } else {
      // Insert into business table
      const businessQuery = `
                INSERT INTO business (tin, business_name, title, first_name, last_name, customer_type)
                VALUES ($1, $2, $3, $4, $5, $6)`;

      const businessValues = [
        tax_id,
        business_name,
        title,
        first_name,
        last_name,
        customer_type,
      ];
      await client.query(businessQuery, businessValues);
    }

    await client.query('COMMIT'); // Commit transaction

    // Respond with the created customer and associated info
    res.status(201).json({
      tax_id: newTaxId,
      message: 'Customer created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    if (error.code === '23505') {
      // Unique violation error code for PostgreSQL
      return res
        .status(409)
        .send('Error: Customer with tax_id already exists.');
    }
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  } finally {
    client.release(); // Release the client back to the pool
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
