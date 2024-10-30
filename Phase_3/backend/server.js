const express = require('express');
const expressListRoutes = require('express-list-routes');
const customerRoutes = require('./routes/customer');
const vendorRoutes = require('./routes/vendor');
const reportsRoutes = require('./routes/reports');
const partsOrderRoutes = require('./routes/partsorder');
const vehicleRoutes = require('./routes/vehicle');
const pool = require('./config/db'); // Import database pool configuration
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/vehicle', vehicleRoutes);
app.use('/customer', customerRoutes);
app.use('/vendor', vendorRoutes);
app.use('/reports', reportsRoutes);
app.use('/partsorder', partsOrderRoutes);

// debug what routes are registered
console.log('Registered Routes:');
expressListRoutes(app);

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
};

const stopServer = async (server) => {
  return new Promise(async (resolve) => {
    await pool.end(); // Close the PostgreSQL connection pool
    server.close(() => {
      console.log('Server closed.');
      resolve();
    });
  });
};

module.exports = { startServer, stopServer };
