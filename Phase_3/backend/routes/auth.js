const express = require('express');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const router = express.Router();
const { loginValidator } = require('./validators');

// Middleware to check if a user is logged in
const checkSession = (req, res, next) => {
  if (req.session.user) {
    next(); // User is logged in, proceed to the next middleware/route
  } else {
    res.status(401).json({ message: 'Unauthorized' }); // User is not logged in
  }
};

// Middleware to check if a user is a specific user
const checkSessionUserType = (reqUserTypes) => (req, res, next) => {
  const user = req.session.user;
  if (user && reqUserTypes.includes(user.user_type)) {
    console.log(
      'USER',
      req.session.user.username,
      'USER TYPE',
      req.session.user.user_type
    );
    next(); // User is logged in and has the correct user_type, proceed
  } else {
    res.status(401).json({ message: 'Unauthorized' });
    // User is not logged in or has the wrong user_type
  }
};

router.post('/login', loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  console.log(username, password);

  try {
    const query =
      'SELECT * FROM app_user WHERE username = $1 AND password = $2';
    const values = [username, password];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log(user);

    // create session after successfull login
    req.session.user = {
      username: user.username,
      user_type: user.user_type,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    return res.status(200).json({
      message: 'Login successful',
      user: req.session.user,
    });
  } catch (error) {
    console.log('Error during login: ', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not logout' });
    }
    return res.status(200).json({ message: 'Logout successfull' });
  });
});

// Route to check session
router.get('/session', checkSession, (req, res) => {
  // If the middleware passed, the user is logged in
  res.json({ user: req.session.user });
});

module.exports = { router, checkSession, checkSessionUserType };
