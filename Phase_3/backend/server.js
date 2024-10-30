const express = require('express');
const customerRoutes = require('./routes/customer');
const vendorRoutes = require('./routes/vendor');
const reportsRoutes = require('./routes/reports');
const partsOrderRoutes = require('./routes/partsorder');
const pool = require('./config/db'); // Import your pool configuration
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/customer', customerRoutes);
app.use('/vendor', vendorRoutes);
app.use('/reports', reportsRoutes);
app.use('/partsorder', partsOrderRoutes);

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
