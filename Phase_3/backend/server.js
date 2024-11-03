const express = require('express');
const morgan = require('morgan');
const expressListRoutes = require('express-list-routes');
const session = require('express-session');
const cors = require('cors');
const { router: authRoutes } = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const vendorRoutes = require('./routes/vendor');
const reportsRoutes = require('./routes/reports');
const partsOrderRoutes = require('./routes/partsorder');
const vehicleRoutes = require('./routes/vehicle');
const rootRoute = require('./routes/root');
const pool = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use('/', rootRoute);
app.use('/auth', authRoutes);
app.use('/vehicle', vehicleRoutes);
app.use('/customer', customerRoutes);
app.use('/vendor', vendorRoutes);
app.use('/reports', reportsRoutes);
app.use('/partsorder', partsOrderRoutes);

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
    await pool.end();
    server.close(() => {
      console.log('Server closed.');
      resolve();
    });
  });
};

module.exports = { startServer, stopServer };
