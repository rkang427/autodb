const express = require('express');
const expressListRoutes = require('express-list-routes');
const session = require('express-session');
const cors = require('cors');
const { router: authRoutes } = require('./routes/auth');
const pool = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use('/auth', authRoutes);

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
