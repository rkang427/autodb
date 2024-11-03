const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db');
const { customerGetValidator, customerPostValidator } = require('./validators');
const { PG_ERROR_CODES } = require('../config/constants');
const { checkSessionUserType } = require('../routes/auth');


// GET endpoint to check if customer exists by tax_id
router.get(
  '/',
  customerGetValidator,
  checkSessionUserType(['inventory_clerk', 'owner', 'sales_person', 'manager']),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const taxId = req.query.tax_id;

      const query = `SELECT tax_id FROM customer WHERE tax_id = $1`;
      const values = [taxId];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'No customer found with the provided tax_id' });
      }

      res.status(200).json({ tax_id: result.rows[0].tax_id });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Error connecting to the database' });
    }
  }
);

// POST endpoint to create a new customer
router.post(
  '/',
  customerPostValidator,
  checkSessionUserType(['inventory_clerk', 'owner', 'sales_person']),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      console.error('Database error:', error); //in order to debug, logging an error to server console for what was wrong
      if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        return res
          .status(409)
          .json({ error: 'Error: Customer with tax_id already exists.' });
      }
      if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
        return res
          .status(400)
          .send('Error: One or more fields exceed the maximum length.');
      }
      res.status(500).json({ error: 'Error connecting to the database' });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);

module.exports = router;
