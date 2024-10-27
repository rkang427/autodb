const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const PG_ERROR_CODES = require('../config/constants');

// GET endpoint to check if customer exists by tax_id
router.get('/', async (req, res) => {
  try {
    const taxId = req.query.tax_id;

    if (!taxId) {
      return res.status(400).send('Error: tax_id query parameter is required.');
    }

    const query = `SELECT tax_id FROM customer WHERE tax_id = $1`;
    const values = [taxId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send('No customer found with the provided tax_id');
    }

    res.status(200).json({ tax_id: result.rows[0].tax_id });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  }
});

// POST endpoint to create a new customer
router.post('/', async (req, res) => {
  const {
    tax_id,
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

  // Validate customer_type
  if (!customer_type || !['i', 'b'].includes(customer_type)) {
    return res
      .status(400)
      .json({ error: "Error: customer_type must be either 'i' or 'b'." });
  }

  // Collecting missing fields
  const missingFields = [];
  if (!tax_id) missingFields.push('tax_id');
  if (!phone_number) missingFields.push('phone_number');
  if (!street) missingFields.push('street');
  if (!first_name) missingFields.push('first_name');
  if (!last_name) missingFields.push('last_name');
  if (!city) missingFields.push('city');
  if (!state) missingFields.push('state');
  if (!postal_code) missingFields.push('postal_code');

  if (customer_type === 'b') {
    if (!business_name) missingFields.push('business_name');
    if (!title) missingFields.push('title');
  } else if (customer_type === 'i') {
    if (business_name || title) {
      return res.status(400).json({
        error:
          'Error: business_name and title cannot be provided for individual customers.',
      });
    }
  }

  // If any required fields are missing, respond with a 400 status
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Error: Missing required fields',
      missingFields,
    });
  }

  // Validate lengths of fields
  const lengthChecks = [
    { field: 'first_name', value: first_name, maxLength: 120 },
    { field: 'last_name', value: last_name, maxLength: 120 },
    { field: 'business_name', value: business_name, maxLength: 120 },
    { field: 'phone_number', value: phone_number, exactLength: 10 },
    { field: 'street', value: street, maxLength: 120 },
    { field: 'city', value: city, maxLength: 120 },
    { field: 'state', value: state, maxLength: 120 },
    { field: 'postal_code', value: postal_code, exactLength: 5 },
  ];

  for (const { field, value, maxLength, exactLength } of lengthChecks) {
    if (exactLength && value && value.length !== exactLength) {
      return res.status(400).json({
        error: `Error: ${field} must be exactly ${exactLength} digits long.`,
      });
    }
    if (maxLength && value && value.length > maxLength) {
      return res.status(400).json({
        error: `Error: ${field} must not exceed ${maxLength} characters.`,
      });
    }
  }

  // Validate phone_number format
  const phoneRegex = /^\d{10}$/;
  if (phone_number && !phoneRegex.test(phone_number)) {
    return res.status(400).json({
      error: 'Error: phone_number must be 10 digits long without dashes.',
    });
  }

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
    const newTaxId = customerResult.rows[0].tax_id;

    // Insert into individual or business table based on customer_type
    if (customer_type === 'i') {
      await client.query(
        `
        INSERT INTO individual (ssn, first_name, last_name, customer_type)
        VALUES ($1, $2, $3, $4)`,
        [tax_id, first_name, last_name, customer_type]
      );
    } else {
      await client.query(
        `
        INSERT INTO business (tin, business_name, title, first_name, last_name, customer_type)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [tax_id, business_name, title, first_name, last_name, customer_type]
      );
    }

    await client.query('COMMIT'); // Commit transaction

    res
      .status(201)
      .json({ tax_id: newTaxId, message: 'Customer created successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
      return res
        .status(409)
        .json({ error: 'Error: Customer with tax_id already exists.' });
    }
    res.status(500).json({ error: 'Error connecting to the database' });
  } finally {
    client.release(); // Release the client back to the pool
  }
});

module.exports = router;
