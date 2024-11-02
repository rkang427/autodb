const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db');
const { partsOrderPostValidator } = require('./validators');
const PG_ERROR_CODES = require('../config/constants');
const { checkSessionUserType } = require('../routes/auth');

// POST endpoint to create a new parts order
router.post(
  '/',
  partsOrderPostValidator,
  checkSessionUserType(['inventory_clerk', 'owner']),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vin, vendor_name } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Start transaction

      // Insert into the parts order table
      const partsOrderQuery = `
    INSERT INTO parts_order (vin, ordinal, vendor_name) SELECT CAST($1 as VARCHAR(17)), COUNT(*) + 1, $2 from parts_order WHERE vin::VARCHAR(17)=$1 RETURNING parts_order_number; 
     `;

      const partsOrderValue = [String(vin), vendor_name];

      const partsOrderResult = await client.query(
        partsOrderQuery,
        partsOrderValue
      );
      const newPartsOrderNumber = partsOrderResult.rows[0].parts_order_number;

      // TODO: add the parts to the part order

      await client.query('COMMIT'); // Commit transaction

      res.status(201).json({
        parts_order_number: newPartsOrderNumber,
        message: 'Parts Order created successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error); //in order to debug, logging an error to server console for what was wrong
      if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
        return res.status(400).json({
          error: 'Error: One or more fields exceed the maximum length.',
        });
      }
      res.status(500).json({ error: 'Error connecting to the database' });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);

module.exports = router;
