const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const PG_ERROR_CODES = require('../config/constants');

// GET endpoint to retrieve a vendor by name
router.get('/', async (req, res) => {
  try {
    const vendorName = req.query.name;

    if (!vendorName) {
      return res.status(400).send('Error: name query parameter is required.');
    }

    const query = `
      SELECT name, phone_number, street, city, state, postal_code
      FROM vendor
      WHERE name = $1`;
    const values = [vendorName];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send('No vendor found with the provided name');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  }
});

// POST endpoint to create a new vendor
router.post('/', async (req, res) => {
  const { name, phone_number, street, city, state, postal_code } = req.body;

  // Validate required fields
  if (!name || !phone_number || !street || !city || !state || !postal_code) {
    return res.status(400).send('Error: All fields are required.');
  }

  // Validate lengths of fields
  if (name.length > 120) {
    return res.status(400).send('Error: name must be 120 characters or fewer.');
  }
  if (phone_number.length !== 10) {
    return res
      .status(400)
      .send('Error: phone_number must be exactly 10 digits long.');
  }
  if (street.length > 120) {
    return res
      .status(400)
      .send('Error: street must be 120 characters or fewer.');
  }
  if (city.length > 120) {
    return res.status(400).send('Error: city must be 120 characters or fewer.');
  }
  if (state.length > 120) {
    return res
      .status(400)
      .send('Error: state must be 120 characters or fewer.');
  }
  if (postal_code.length !== 5) {
    return res
      .status(400)
      .send('Error: postal_code must be exactly 5 digits long.');
  }

  // Validate phone_number format
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone_number)) {
    return res
      .status(400)
      .send('Error: phone_number must be 10 digits long without dashes.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    const vendorQuery = `
      INSERT INTO vendor (name, phone_number, street, city, state, postal_code)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING name;`;

    const vendorValues = [name, phone_number, street, city, state, postal_code];
    const vendorResult = await client.query(vendorQuery, vendorValues);
    const newVendorName = vendorResult.rows[0].name; // Get the new vendor's name

    await client.query('COMMIT'); // Commit transaction

    // Respond with the created vendor information
    res.status(201).json({
      name: newVendorName,
      message: 'Vendor created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
      return res
        .status(409)
        .send('Error: Vendor with this name already exists.');
    }
    if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
      return res
        .status(400)
        .send('Error: One or more fields exceed the maximum length.');
    }
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  } finally {
    client.release(); // Release the client back to the pool
  }
});

module.exports = router;
