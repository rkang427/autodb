const express = require('express');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const {
  vehicleGetValidator,
  vehiclePostValidator,
  vehicleSearchValidator,
} = require('./validators');
const { PG_ERROR_CODES } = require('../config/constants');

const router = express.Router();

console.log('loading vehicle routes');
// GET endpoint to check if vehicle exists by vin
router.get('/search', vehicleGetValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      vin,
      color,
      manufacturer,
      vehicle_type,
      fuel_type,
      model_year,
      keyword,
      filter_type,
    } = req.query;
    // TODO: SET include_parts_not_ready depending on user_type
    // TODO: check if filter_type is value allowed for user_type
    const include_parts_not_ready = false;

    const query = `
      SELECT
        vw.vin,
        vw.vehicle_type,
        vw.manufacturer,
        vw.model,
        vw.model_year,
        vw.fuel_type,
        vw.colors,
        vw.horsepower,
        vw.sale_price
      FROM (
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
          v.sale_date,
          STRING_AGG(vc.color, ', ') AS colors,
          ROUND((1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2) AS sale_price
        FROM vehicle AS v
        LEFT JOIN vehicle_color AS vc ON v.vin = vc.vin
        GROUP BY
          v.vin,
          v.vehicle_type,
          v.manufacturer,
          v.model,
          v.model_year,
          v.fuel_type,
          v.horsepower,
          v.purchase_price,
          v.sale_date
      ) AS vw
      WHERE
        (vw.vin NOT IN (
          SELECT po.vin
          FROM parts_order AS po
          INNER JOIN part AS p ON po.parts_order_number = p.parts_order_number
          WHERE p.status <> 'installed') OR $1)
        AND ((vw.sale_date IS NULL AND $2 = 'unsold')
        OR (vw.sale_date IS NOT NULL AND $2 = 'sold') OR ($2 = 'both'))
        AND (vw.vehicle_type = $3 OR $3 IS NULL)
        AND (vw.manufacturer = $4 OR $4 IS NULL)
        AND (vw.model_year = $5 OR $5 IS NULL)
        AND (vw.fuel_type = $6 OR $6 IS NULL)
        AND (vw.colors LIKE $7 OR $7 IS NULL)
        AND (LOWER(vw.vin) = LOWER($8) OR $8 IS NULL)
        AND (
          (vw.manufacturer ILIKE $9 OR $9 = '')
          OR (vw.model ILIKE $9 OR $9 = '')
          OR (vw.model_year::TEXT ILIKE $9 OR $9 = '')
          OR (vw.description ILIKE $9 OR $9 = '')
        )
      ORDER BY vw.vin ASC;
    `;

    const values = [
      include_parts_not_ready, // $1
      filter_type || 'unsold', // $2
      vehicle_type || null, // $3
      manufacturer || null, // $4
      model_year || null, // $5
      fuel_type || null, // $6
      color ? `%${color}%` : null, // $7
      vin || null, // $8
      keyword ? `%${keyword}%` : '', // $9
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send('No vehicle found with the provided criteria');
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Error connecting to the database');
  }
});

router.get('/', vehicleSearchValidator, async (req, res) => {
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
router.post('/', vehiclePostValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller,
    colors,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // Insert into the vehicle table
    const vehicleQuery = `
        INSERT INTO vehicle (
        vin,
        description,
        horsepower,
        model_year,
        model,
        manufacturer,
        vehicle_type,
        purchase_price,
        purchase_date,
        condition,
        fuel_type,
        inventory_clerk,
        customer_seller
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10, $11, $12)`;

    const vehicleValues = [
      vin,
      description,
      horsepower,
      model_year,
      model,
      manufacturer,
      vehicle_type,
      purchase_price,
      condition,
      fuel_type,
      inventory_clerk,
      customer_seller,
    ];
    await client.query(vehicleQuery, vehicleValues);

    // Insert into the vehicle_color table any colors for this vehicle
    if (colors && colors.length > 0) {
      const colorInsertQuery = `
          INSERT INTO vehicle_color (vin, color)
          VALUES ${colors.map((color, index) => `($1, $${index + 2})`).join(', ')}`;

      const colorValues = [vin, ...colors];
      await client.query(colorInsertQuery, colorValues);
    }

    await client.query('COMMIT'); // Commit transaction

    res.status(201).json({
      vin,
      description,
      horsepower,
      model_year,
      model,
      manufacturer,
      vehicle_type,
      purchase_price,
      condition,
      fuel_type,
      inventory_clerk,
      customer_seller,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
      return res.status(409).json({ error: 'Error: Vehicle already exists.' });
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
});

module.exports = router;

console.log('finished loading vehicle');
