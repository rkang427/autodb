const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db');
const { partsOrderPostValidator } = require('./validators');
const PG_ERROR_CODES = require('../config/constants');
const { checkSessionUserType } = require('../routes/auth');

router.post(
  '/',
  partsOrderPostValidator,
  checkSessionUserType(['inventory_clerk', 'owner']),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vin, vendor_name, parts } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Start transaction

      // Insert into parts_order and get parts_order_number
      const partsOrderQuery = `
      INSERT INTO parts_order (vin, ordinal, vendor_name)
      VALUES (CAST($1 AS VARCHAR(17)), (SELECT COUNT(*) + 1 FROM parts_order WHERE vin::VARCHAR(17) = $1), $2)
      RETURNING parts_order_number;
    `;
      const result = await client.query(partsOrderQuery, [vin, vendor_name]);
      const parts_order_number = result.rows[0].parts_order_number;

      // Insert each part into the parts table
      const partsInsertQuery = `
      INSERT INTO part (parts_order_number, part_number, description, quantity, unit_price) 
      VALUES ($1, $2, $3, $4, $5);
    `;

      for (const part of parts) {
        await client.query(partsInsertQuery, [
          parts_order_number,
          part.part_number,
          part.description,
          part.quantity,
          part.unit_price,
        ]);
      }

      const vehicleTotalPartPriceQuery = `
    UPDATE vehicle v
      SET
      total_parts_price = (
      SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
      FROM part AS p
      INNER JOIN
      parts_order AS po
      ON p.parts_order_number = po.parts_order_number
      WHERE po.vin = $1
      )
      WHERE v.vin = $1;
    `;
      const vehicleUpdateResult = await client.query(
        vehicleTotalPartPriceQuery,
        [vin]
      );
      //TODO: check that update works
      await client.query('COMMIT'); // Commit transaction

      res.status(201).json({
        parts_order_number: parts_order_number,
        message: 'Parts Order created successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
        return res
          .status(400)
          .send('Error: One or more fields exceed the maximum length.');
      }
      if (error.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
        return res
          .status(400)
          .send(
            'Error: One or more foreign keys does not exist, check vin or vendor'
          );
      }
      res.status(500).json({ error: 'Error connecting to the database' });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);

// Define the order of statuses
const STATUS_ORDER = {
  ordered: 1,
  received: 2,
  installed: 3,
};

router.patch('/updateStatus', async (req, res) => {
  const { part_number, parts_order_number, status } = req.body;

  // Validate the new status
  if (!['ordered', 'received', 'installed'].includes(status)) {
    return res.status(400).send('Invalid status');
  }

  try {
    // Fetch the current status of the part
    const currentStatusResult = await pool.query(
      `SELECT status FROM part WHERE part_number = $1 AND parts_order_number = $2;`,
      [part_number, parts_order_number]
    );

    // If no matching part found
    if (currentStatusResult.rowCount === 0) {
      return res.status(404).json({ message: 'Part not found' });
    }

    const currentStatus = currentStatusResult.rows[0].status;

    // Check if the new status is allowed
    if (STATUS_ORDER[status] < STATUS_ORDER[currentStatus]) {
      return res
        .status(400)
        .send('Status cannot be changed to a previous state');
    }

    // Update the part status if valid
    const updatePartStatusQuery = `
      UPDATE part
      SET status = $1
      WHERE part_number = $2 AND parts_order_number = $3;
    `;
    const result = await pool.query(updatePartStatusQuery, [
      status,
      part_number,
      parts_order_number,
    ]);

    res.status(200).json({ message: 'Part status updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update part status' });
  }
});
//imagine that the person send the vin and vendor and also list of tuples/dictionary that were the part name , part description, part quanity, and part unit price

module.exports = router;
