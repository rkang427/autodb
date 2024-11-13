const express = require('express');
const { validationResult } = require('express-validator');
const { vendorGetValidator, vendorPostValidator } = require('./validators');
const pool = require('../config/db');
const { PG_ERROR_CODES } = require('../config/constants');
const { checkSessionUserType } = require('../routes/auth');

const router = express.Router();

// GET endpoint to retrieve a vendor by name
router.get(
  '/',
 // vendorGetValidator,
  checkSessionUserType(['inventory_clerk', 'owner', 'manager']),
  async (req, res) => {
  //  const errors = validationResult(req);

    /*if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }*/
    try {
      const vendorName = req.query.name;

      const query = `
      SELECT name
      FROM vendor`;

      const values = [];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'No vendor found with the provided name' });
      }

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Error connecting to the database' });
    }
  }
);

// POST endpoint to create a new vendor
router.post(
  '/',
  vendorPostValidator,
  checkSessionUserType(['inventory_clerk', 'owner']),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, phone_number, street, city, state, postal_code } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // Start transaction

      const vendorQuery = `
      INSERT INTO vendor (name, phone_number, street, city, state, postal_code)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING name;`;

      const vendorValues = [
        name,
        phone_number,
        street,
        city,
        state,
        postal_code,
      ];
      const vendorResult = await client.query(vendorQuery, vendorValues);
      const newVendorName = vendorResult.rows[0].name; // Get the new vendor's name

      await client.query('COMMIT'); // Commit transaction

      // Respond with the created vendor information
      res.status(201).json({
        name: newVendorName,
        msg: 'Vendor created successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback on error
      if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        return res
          .status(409)
          .json({ error: 'Error: Vendor with this name already exists.' });
      }
      if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
        return res.status(400).json({
          error: 'Error: One or more fields exceed the maximum length.',
        });
      }
      console.error('Database connection error:', error);
      res.status(500).json({ error: 'Error connecting to the database' });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);

module.exports = router;
