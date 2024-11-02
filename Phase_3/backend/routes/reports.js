const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const PG_ERROR_CODES = require('../config/constants');
const { checkSessionUserType } = require('../routes/auth');

//make test_backend from cs6400....
// Route to get part statistics
router.get(
  '/part_statistics',
  checkSessionUserType(['manager', 'owner']),
  async (req, res) => {
    const query = `
    SELECT
      vendor.name,
      SUM(part.quantity) AS totalpartsquantity,
      SUM(part.quantity * part.unit_price) AS vendortotalexpense
    FROM parts_order AS partsorder
    INNER JOIN part AS part
      ON partsorder.parts_order_number = part.parts_order_number
    INNER JOIN vendor AS vendor
      ON partsorder.vendor_name = vendor.name
    GROUP BY vendor.name
    ORDER BY vendortotalexpense DESC;
  `;

    try {
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Error retrieving part statistics' });
    }
  }
);

// Route to get price per condition report
router.get(
  '/price_condition',
  checkSessionUserType(['manager', 'owner']),
  async (req, res) => {
    const query = `
    SELECT
      vt.vehicle_type,
      COALESCE(SUM(CASE WHEN v.condition = 'Excellent' THEN v.purchase_price ELSE 0 END), 0) AS excellenttotalprice,
      COALESCE(SUM(CASE WHEN v.condition = 'Very Good' THEN v.purchase_price ELSE 0 END), 0) AS verygoodtotalprice,
      COALESCE(SUM(CASE WHEN v.condition = 'Good' THEN v.purchase_price ELSE 0 END), 0) AS goodtotalprice,
      COALESCE(SUM(CASE WHEN v.condition = 'Fair' THEN v.purchase_price ELSE 0 END), 0) AS fairtotalprice
    FROM (
      SELECT UNNEST(ARRAY[
        'Sedan',
        'Coupe',
        'Convertible',
        'CUV',
        'Truck',
        'Van',
        'Minivan',
        'SUV',
        'Other'
      ]) AS vehicle_type
    ) AS vt
    LEFT JOIN vehicle AS v ON vt.vehicle_type = v.vehicle_type
    GROUP BY vt.vehicle_type
    ORDER BY vt.vehicle_type DESC;
  `;

    try {
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error executing query:', error);
      res
        .status(500)
        .json({ error: 'Error retrieving price per condition report' });
    }
  }
);

// Route to get Average Time in Inventory
router.get(
  '/avg_time_in_inventory',
  checkSessionUserType(['manager', 'owner']),
  async (req, res) => {
    const query = `
  SELECT
    vt.vehicle_type,
    COALESCE(
        AVG(
            DATE_PART(
                'day', v.sale_date::TIMESTAMP - v.purchase_date::TIMESTAMP
            )
            + 1
        )::VARCHAR,
        'N/A'
    ) AS average_time_in_inventory
FROM (
    SELECT UNNEST(ARRAY[
        'Sedan',
        'Coupe',
        'Convertible',
        'CUV',
        'Truck',
        'Van',
        'Minivan',
        'SUV',
        'Other'
    ]) AS vehicle_type
) AS vt
LEFT JOIN
    vehicle AS v
    ON vt.vehicle_type = v.vehicle_type AND v.sale_date IS NOT NULL
GROUP BY vt.vehicle_type
ORDER BY vt.vehicle_type;
  `;

    try {
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Error retrieving avg time in inventory' });
    }
  }
);

module.exports = router;
