const express = require('express');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { vehicleGetValidator } = require('./validators');
const PG_ERROR_CODES = require('../config/constants');

const router = express.Router();

console.log('loading vehicle routes');
// GET endpoint to check if vehicle exists by vin
router.get('/', vehicleGetValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const vin = req.query.vin;

    const query = `
        SELECT
        v.vin,
        v.vehicle_type,
        v.manufacturer,
        v.model,
        v.description,
        v.model_year,
        v.fuel_type,
        v.horsepower,
        v.purchase_price,
        v.total_parts_price,
        v.customer_seller,
        v.customer_buyer,
        v.inventory_clerk,
        v.salesperson,
        v.sale_date,
        STRING_AGG(vc.color, ', ') AS colors,
        ROUND(
        (1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2
        ) AS sale_price
        FROM vehicle AS v
        LEFT JOIN vehicle_color AS vc ON v.vin = vc.vin
        WHERE v.vin::VARCHAR(17) = $1
        GROUP BY
        v.vin,
        v.vehicle_type,
        v.manufacturer,
        v.model,
        v.model_year,
        v.fuel_type,
        v.horsepower,
        v.purchase_price,
        v.total_parts_price,
        v.customer_seller,
        v.customer_buyer,
        v.inventory_clerk,
        v.salesperson,
        v.sale_date`;
    const values = [vin];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send('No vehicle found with the provided vin');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  }
});

// POST endpoint to create a new vehicle
//router.post('/', vehiclePostValidator, async (req, res) => {
//  const errors = validationResult(req);
//
//  if (!errors.isEmpty()) {
//    return res.status(400).json({ errors: errors.array() });
//  }
//
//  const {
//    vin,
//  } = req.body;
//
//  const client = await pool.connect();
//  try {
//    await client.query('BEGIN'); // Start transaction
//
//    // Insert into the customer table
//    const customerQuery = `
//      INSERT INTO customer (tax_id, street, city, state, postal_code, customer_type, email, phone_number)
//      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//      RETURNING tax_id`;
//
//    const customerValues = [
//      tax_id,
//      street,
//      city,
//      state,
//      postal_code,
//      customer_type,
//      email,
//      phone_number,
//    ];
//
//    const customerResult = await client.query(customerQuery, customerValues);
//    const newTaxId = customerResult.rows[0].tax_id;
//
//    // Insert into individual or business table based on customer_type
//    if (customer_type === 'i') {
//      await client.query(
//        `
//        INSERT INTO individual (ssn, first_name, last_name, customer_type)
//        VALUES ($1, $2, $3, $4)`,
//        [tax_id, first_name, last_name, customer_type]
//      );
//    } else {
//      await client.query(
//        `
//        INSERT INTO business (tin, business_name, title, first_name, last_name, customer_type)
//        VALUES ($1, $2, $3, $4, $5, $6)`,
//        [tax_id, business_name, title, first_name, last_name, customer_type]
//      );
//    }
//
//    await client.query('COMMIT'); // Commit transaction
//
//    res
//      .status(201)
//      .json({ tax_id: newTaxId, message: 'Customer created successfully' });
//  } catch (error) {
//    await client.query('ROLLBACK');
//    console.error('Database error:', error); //in order to debug, logging an error to server console for what was wrong
//    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
//      return res
//        .status(409)
//        .json({ error: 'Error: Customer with tax_id already exists.' });
//    }
//    if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
//      return res
//        .status(400)
//        .send('Error: One or more fields exceed the maximum length.');
//    }
//    res.status(500).json({ error: 'Error connecting to the database' });
//  } finally {
//    client.release(); // Release the client back to the pool
//  }
//});
//

module.exports = router;

console.log('finished loading vehicle');
