const express = require('express');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const {
  vehicleGetValidator,
  vehiclePostValidator,
  vehiclePatchValidator,
  vehicleSearchValidator,
} = require('./validators');
const { PG_ERROR_CODES } = require('../config/constants');
const { checkSessionUserType } = require('../routes/auth');

const router = express.Router();

// GET endpoint to check if vehicle exists by vin
// Any user, even if not logged in, can search
// But their results may differ
router.get('/search', vehicleSearchValidator, async (req, res) => {
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
    // Defaults for public search
    var user_type = null;
    var include_parts_not_ready = false;
    if (req.session.user) {
      user_type = req.session.user.user_type;
      if (['owner', 'inventory_clerk', 'manager'].includes(user_type)) {
        include_parts_not_ready = true;
      }
    }

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
      return res.status(404).json({
        errors: [{ msg: 'Sorry, it looks like we don’t have that in stock!' }],
      });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database connection error:', error);
    res
      .status(500)
      .json({ errors: [{ msg: 'Error connecting to the database' }] });
  }
});

router.get('/', vehicleGetValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const vin = req.query.vin;

    // Determine if user is authenticated and their type
    const userAuthenticated = !!req.session.user;
    const isOwnerManager =
      userAuthenticated &&
      ['owner', 'manager'].includes(req.session.user.user_type);
    const isPartsViewer =
      userAuthenticated &&
      ['owner', 'manager', 'inventory_clerk'].includes(
        req.session.user.user_type
      );

    // Construct the query conditionally
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
          ${isPartsViewer ? 'v.purchase_price,' : 'NULL AS purchase_price,'}
          ${isPartsViewer ? 'v.total_parts_price,' : 'NULL AS total_parts_price,'}
          ${isOwnerManager ? 'v.customer_seller,' : 'NULL AS customer_seller,'}
          ${isOwnerManager ? 'v.customer_buyer,' : 'NULL AS customer_buyer,'}
          ${isOwnerManager ? 'v.salesperson,' : 'NULL AS salesperson,'}
          ${isOwnerManager ? 'v.inventory_clerk,' : 'NULL AS inventory_clerk,'}
          ${isOwnerManager ? 'v.sale_date,' : 'NULL AS sale_date,'}
          STRING_AGG(vc.color, ', ') AS colors,
          ROUND(
            (1.25 * COALESCE(v.purchase_price, 0)) + (1.1 * COALESCE(v.total_parts_price, 0)), 2
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
          v.customer_seller,
          v.customer_buyer,
          v.salesperson,
          v.inventory_clerk,
          v.sale_date`;

    const vehicleResult = await pool.query(query, [vin]);

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({
        errors: [{ msg: 'No vehicle found with the provided vin' }],
      });
    }
    vehicle = vehicleResult.rows[0];

    var parts = [];
    var customer_seller = null;
    var customer_buyer = null;
    var salesperson = null;
    var inventory_clerk = null;
    if (isPartsViewer) {
      const partsQuery = `SELECT
            p.part_number,
            p.description,
            p.quantity,
            p.unit_price,
            p.status,
            p.parts_order_number,
            po.vendor_name
            FROM part AS p
            INNER JOIN parts_order AS po ON p.parts_order_number = po.parts_order_number
            WHERE po.vin = $1
            ORDER BY p.parts_order_number;`;
      const partsResult = await pool.query(partsQuery, [vin]);
      if (partsResult.rows.length > 0) {
        parts = partsResult.rows;
      }
    }
    if (isOwnerManager && vehicle.customer_seller) {
      const sellerQuery = `SELECT
            cs.phone_number,
            CONCAT(cs.street, ', ', cs.city, ', ', cs.state, ', ', cs.postal_code) AS address,
            TRIM(COALESCE(CONCAT(b.title, ' ', b.first_name, ' ', b.last_name, ' ', i.first_name, ' ', i.last_name), '')) AS contact,
            COALESCE(b.business_name, NULL) AS business_name FROM customer AS cs
            LEFT JOIN individual AS i ON cs.tax_id = i.ssn
            LEFT JOIN business AS b ON cs.tax_id = b.tin
            WHERE cs.tax_id = $1;`;
      const sellerResult = await pool.query(sellerQuery, [
        vehicle.customer_seller,
      ]);
      if (sellerResult.rows.length > 0) {
        customer_seller = sellerResult.rows[0];
      }
    }
    if (isOwnerManager && vehicle.customer_buyer) {
      const buyerQuery = `SELECT
            cs.phone_number,
            CONCAT(cs.street, ', ', cs.city, ', ', cs.state, ', ', cs.postal_code) AS address,
            TRIM(COALESCE(CONCAT(b.title, ' ', b.first_name, ' ', b.last_name, ' ', i.first_name, ' ', i.last_name), '')) AS contact,
            COALESCE(b.business_name, NULL) AS business_name FROM customer AS cs
            LEFT JOIN individual AS i ON cs.tax_id = i.ssn
            LEFT JOIN business AS b ON cs.tax_id = b.tin
            WHERE cs.tax_id = $1;`;
      const buyerResult = await pool.query(buyerQuery, [
        vehicle.customer_buyer,
      ]);
      if (buyerResult.rows.length > 0) {
        customer_buyer = buyerResult.rows[0];
      }
    }
    if (isOwnerManager && vehicle.inventory_clerk) {
      const invClerkQuery = `SELECT
          CONCAT(
          e.first_name, ' ', e.last_name
          ) AS name
          FROM app_user as e
          WHERE e.username = $1;`;
      const invClerkResult = await pool.query(invClerkQuery, [
        vehicle.inventory_clerk,
      ]);
      if (invClerkResult.rows.length > 0) {
        inventory_clerk = invClerkResult.rows[0];
      }
    }
    if (isOwnerManager && vehicle.salesperson) {
      const salesPersonQuery = `SELECT
          CONCAT(
          e.first_name, ' ', e.last_name
          ) AS name
          FROM app_user as e
          WHERE e.username = $1;`;
      const salesPersonResult = await pool.query(salesPersonQuery, [
        vehicle.salesperson,
      ]);
      if (salesPersonResult.rows.length > 0) {
        salesperson = salesPersonResult.rows[0];
      }
    }
    res.status(200).json({
      vehicle: vehicleResult.rows[0],
      parts: parts,
      customer_seller: customer_seller,
      customer_buyer: customer_buyer,
      salesperson: salesperson,
      inventory_clerk: inventory_clerk,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res
      .status(500)
      .json({ errors: [{ msg: 'Error connecting to the database' }] });
  }
});

// POST endpoint to create a new vehicle
router.post(
  '/',
  vehiclePostValidator,
  checkSessionUserType(['owner', 'inventory_clerk']),
  async (req, res) => {
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
        return res.status(409).json({
          errors: [{ msg: 'Error: Vehicle with this VIN already exists' }],
        });
      }
      if (error.code === PG_ERROR_CODES.LENGTH_VIOLATION) {
        return res.status(400).json({
          errors: [
            { msg: 'Error: One or more fields exceed the maximum length.' },
          ],
        });
      }
      res.status(500).json({ error: 'Error connecting to the database' });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);
// PATCH method for selling vehicle
router.patch(
  '/',
  vehiclePatchValidator,
  checkSessionUserType(['owner', 'sales_person']),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vin, customer_buyer } = req.body;
    const sales_person = req.session.user.username;

    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Start transaction

      // Check if the vehicle exists and the sale_date is null
      const checkVehicleQuery = `
        SELECT sale_date
        FROM vehicle
        WHERE vin = $1;`;
      const vehicleCheckResult = await client.query(checkVehicleQuery, [vin]);

      if (vehicleCheckResult.rows.length === 0) {
        return res.status(404).json({ errors: [{ msg: 'Vehicle not found' }] });
      }

      const { sale_date } = vehicleCheckResult.rows[0];
      if (sale_date !== null) {
        return res
          .status(403)
          .json({ errors: [{ msg: 'Vehicle has already been sold' }] });
      }
      const vehicleQuery = `
        UPDATE vehicle
        SET
          sale_date = CURRENT_DATE,
          customer_buyer = $2,
          salesperson = $3
        WHERE vehicle.vin = $1 AND sale_date IS NULL
        RETURNING customer_buyer, vin, to_char(sale_date, 'MM/DD/YYYY') AS sale_date;`;

      const vehicleValues = [vin, customer_buyer, sales_person];
      const result = await client.query(vehicleQuery, vehicleValues);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Update failed' });
      }

      const updatedVehicle = result.rows[0];

      await client.query('COMMIT'); // Commit transaction

      res.status(200).json(updatedVehicle);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      res
        .status(500)
        .json({ errors: [{ msg: 'Error connecting to the database' }] });
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
);

module.exports = router;
