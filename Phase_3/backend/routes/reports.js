const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkSessionUserType } = require('../routes/auth');

// Report 1: View Seller's History
router.get('/view_seller_history', checkSessionUserType(['manager', 'owner']), async (req, res) => {
  const query = `
    SELECT
      COALESCE(b.business_name, CONCAT(i.first_name, ' ', i.last_name)) AS namebusiness,
      COUNT(DISTINCT v.vin) AS vehiclecount,
      COALESCE(ROUND(AVG(v.purchase_price), 2), 0) AS averagepurchaseprice,
      COALESCE(SUM(p.quantity), 0) AS totalpartscount,
      COALESCE(
        ROUND(SUM(p.quantity * p.unit_price) / NULLIF(COUNT(DISTINCT v.vin), 0), 2), 
        0
      ) AS averagepartscostpervehiclepurchased,
      CASE
        WHEN SUM(p.quantity) >= 5 THEN 'highlight'  
        WHEN ROUND(SUM(p.quantity * p.unit_price) / NULLIF(COUNT(DISTINCT v.vin), 0), 2) >= 500 THEN 'highlight' 
        ELSE 'no'
      END AS highlight
      FROM vehicle AS v
      LEFT JOIN parts_order AS po ON v.vin = po.vin
      LEFT JOIN part AS p ON po.parts_order_number = p.parts_order_number
      INNER JOIN customer AS cs ON v.customer_seller = cs.tax_id
      LEFT JOIN individual AS i ON cs.tax_id = i.ssn
      LEFT JOIN business AS b ON cs.tax_id = b.tin
      GROUP BY cs.tax_id, b.business_name, i.first_name, i.last_name
      ORDER BY vehiclecount DESC, averagepurchaseprice ASC;

  `;

  try {
    const result = await pool.query(query);
    const formattedResults = result.rows.map(row => ({
      namebusiness: row.namebusiness,
      vehiclecount: row.vehiclecount,
      averagepurchaseprice: row.averagepurchaseprice,
      totalpartscount: row.totalpartscount,
      averagepartscostpervehiclepurchased: row.averagepartscostpervehiclepurchased,
      highlight: row.highlight,
    }));
    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error retrieving seller history');
  }
});

// Report 2: Average Time in Inventory Groups
router.get('/avg_time_in_inventory', checkSessionUserType(['manager', 'owner']), async (req, res) => {
  const query = `
    SELECT vt.vehicle_type,
      COALESCE(AVG(DATE_PART('day', v.sale_date::TIMESTAMP - v.purchase_date::TIMESTAMP) + 1)::VARCHAR, 'N/A') AS average_time_in_inventory
    FROM (SELECT UNNEST(ARRAY['Sedan', 'Coupe', 'Convertible', 'CUV', 'Truck', 'Van', 'Minivan', 'SUV', 'Other']) AS vehicle_type) AS vt
    LEFT JOIN vehicle AS v ON vt.vehicle_type = v.vehicle_type AND v.sale_date IS NOT NULL
    GROUP BY vt.vehicle_type
    ORDER BY vt.vehicle_type;
  `;

  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error retrieving average time in inventory');
  }
});

// Report 3: View Price Per Condition
router.get('/price_per_condition', checkSessionUserType(['manager', 'owner']), async (req, res) => {
  const query = `
    SELECT vt.vehicle_type,
      COALESCE(ROUND(AVG(CASE WHEN v.condition = 'Excellent' THEN v.purchase_price ELSE 0 END),2), 0) AS excellentavgprice,
      COALESCE(ROUND(AVG(CASE WHEN v.condition = 'Very Good' THEN v.purchase_price ELSE 0 END),2), 0) AS verygoodavgprice,
      COALESCE(ROUND(AVG(CASE WHEN v.condition = 'Good' THEN v.purchase_price ELSE 0 END),2), 0) AS goodavgprice,
      COALESCE(ROUND(AVG(CASE WHEN v.condition = 'Fair' THEN v.purchase_price ELSE 0 END),2), 0) AS fairavgprice
    FROM (SELECT UNNEST(ARRAY['Sedan', 'Coupe', 'Convertible', 'CUV', 'Truck', 'Van', 'Minivan', 'SUV', 'Other']) AS vehicle_type) AS vt
    LEFT JOIN vehicle AS v ON vt.vehicle_type = v.vehicle_type
    GROUP BY vt.vehicle_type
    ORDER BY vt.vehicle_type DESC;
  `;

  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error retrieving price per condition');
  }
});

// Report 4: Route to get part statistics
router.get('/part_statistics', checkSessionUserType(['manager', 'owner']), async (req, res) => {
  const query = `
    SELECT vendor.name,
      SUM(part.quantity) AS totalpartsquantity,
      SUM(part.quantity * part.unit_price) AS vendortotalexpense
    FROM parts_order AS partsorder
    INNER JOIN part AS part ON partsorder.parts_order_number = part.parts_order_number
    INNER JOIN vendor AS vendor ON partsorder.vendor_name = vendor.name
    GROUP BY vendor.name
    ORDER BY vendortotalexpense DESC;
  `;

  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error retrieving part statistics');
  }
});

// Report 5: Monthly Sales Report
router.get('/monthly_sales', checkSessionUserType(['manager', 'owner']), async (req, res) => {
  try {
    const originQuery = `
      SELECT
        DATE_PART('year', v.sale_date) AS year_sold,
        DATE_PART('month', v.sale_date) AS month_sold,
        COUNT(DISTINCT v.vin) AS numbervehicles,
        SUM(ROUND((1.25 * COALESCE(v.purchase_price, 0)) + (1.1 * COALESCE(v.total_parts_price, 0)), 2)) AS grossincome,
        (SUM(ROUND((1.25 * COALESCE(v.purchase_price, 0)) + (1.1 * COALESCE(v.total_parts_price, 0)), 2)) - SUM(COALESCE(v.total_parts_price, 0))) AS netincome
      FROM vehicle AS v
      WHERE v.sale_date IS NOT NULL
      GROUP BY DATE_PART('year', v.sale_date), DATE_PART('month', v.sale_date)
      HAVING SUM(ROUND((1.25 * COALESCE(v.purchase_price, 0)) + (1.1 * COALESCE(v.total_parts_price, 0)), 2)) > 0
      ORDER BY year_sold DESC, month_sold DESC;
    `;

    const originResult = await pool.query(originQuery, []);
    
    // Log the results for debugging
    console.log('Origin query result:', originResult.rows);
    
    res.status(200).json(originResult.rows);
  } catch (error) {
    console.error('Error executing queries:', error.message || error);
    res.status(500).send('Error retrieving monthly sales data');
  }
});

// Report 5: Monthly Sales Report
router.get('/monthly_sales/drilldown', checkSessionUserType(['manager', 'owner']), async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;

    // Validate year and month parameters
    if (!month || !year) {
      console.error('Missing year or month parameter');
      return res.status(400).json({ errors: [{ msg: 'Missing year or month parameter' }] });
    }

    console.log(`Received parameters - Year: ${year}, Month: ${month}`);

    const query = `
      SELECT
        au.first_name,
        au.last_name,
        vehiclesold,
        totalsales
      FROM
        (
          SELECT
            e.username,
            COUNT(DISTINCT v.vin) AS vehiclesold,
            SUM(
                ROUND(
                    (1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2
                )
            ) AS totalsales
          FROM vehicle AS v
          INNER JOIN salesperson AS e ON v.salesperson = e.username
          WHERE
            EXTRACT(YEAR FROM v.sale_date) = $1
            AND EXTRACT(MONTH FROM v.sale_date) = $2
          GROUP BY e.username
        ) AS a
      INNER JOIN app_user AS au ON a.username = au.username
      GROUP BY au.first_name, au.last_name, vehiclesold, totalsales
      ORDER BY vehiclesold DESC, totalsales DESC`;

    console.log('Executing drilldown query with parameters:', [year, month]);

    // Execute the query
    const drillDownResult = await pool.query(query, [year, month]);
    console.log('Drilldown query result:', drillDownResult.rows);

    // Check if no results
    if (drillDownResult.rows.length === 0) {
      console.log('No data found for the given year/month');
      return res.status(404).json({
        errors: [{ msg: 'No drilldown data available for that year/month' }],
      });
    }

    // Send successful response
    res.status(200).json(drillDownResult.rows);
  } catch (error) {
    console.error('Error executing queries:', error.message || error);
    res.status(500).send('Error retrieving monthly sales data');
  }
});

module.exports = router;
