const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkSessionUserType } = require('../routes/auth');

const executeQuery = async (query) => {
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Database query failed');
  }
};

router.get('/', async (req, res) => {
  const userAuthenticated = !!req.session.user;
  const isPendingVehiclesViewer =
    userAuthenticated &&
    ['owner', 'manager', 'inventory_clerk'].includes(
      req.session.user.user_type
    );

  const queries = {
    vehiclesReady: `
      SELECT COUNT(*)::int AS count
      FROM vehicle AS v
      LEFT JOIN (
        SELECT po.vin
        FROM parts_order AS po
        INNER JOIN part AS p ON po.parts_order_number = p.parts_order_number
        WHERE p.status <> 'installed'
      ) AS po_not_installed ON v.vin = po_not_installed.vin
      WHERE po_not_installed.vin IS NULL AND v.sale_date IS NULL;`,

    vehiclesNotReady: `
      WITH po_not_installed AS (
        SELECT po.vin
        FROM parts_order AS po
        INNER JOIN part AS p ON po.parts_order_number = p.parts_order_number
        WHERE p.status <> 'installed'
      )
      SELECT COUNT(*)::int AS count
      FROM vehicle AS v
      LEFT JOIN po_not_installed ON v.vin = po_not_installed.vin
      WHERE po_not_installed.vin IS NOT NULL AND v.sale_date IS NULL;`,

    colors: `SELECT DISTINCT color FROM vehicle_color;`,
    fuelTypes: `SELECT DISTINCT fuel_type FROM vehicle;`,
    modelYears: `SELECT DISTINCT model_year FROM vehicle;`,
    manufacturers: `SELECT DISTINCT manufacturer FROM vehicle;`,
    vehicleTypes: `SELECT DISTINCT vehicle_type FROM vehicle;`,
  };

  // Prepare the result object
  const result = {
    ready: null,
    not_ready: null,
    colors: [],
    fuel_types: [],
    manufacturers: [],
    model_years: [],
    vehicle_types: [],
  };

  try {
    // Execute queries
    result.ready = (await executeQuery(queries.vehiclesReady))[0]?.count || 0;

    if (isPendingVehiclesViewer) {
      result.not_ready =
        (await executeQuery(queries.vehiclesNotReady))[0]?.count || 0;
    }

    result.colors = (await executeQuery(queries.colors)).map(
      (row) => row.color
    );
    result.fuel_types = (await executeQuery(queries.fuelTypes)).map(
      (row) => row.fuel_type
    );
    result.model_years = (await executeQuery(queries.modelYears)).map(
      (row) => row.model_year
    );
    result.manufacturers = (await executeQuery(queries.manufacturers)).map(
      (row) => row.manufacturer
    );
    result.vehicle_types = (await executeQuery(queries.vehicleTypes)).map(
      (row) => row.vehicle_type
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ errors: [{ msg: 'Error retreiving landing page' }] });
  }
});

module.exports = router;
