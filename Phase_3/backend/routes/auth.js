const express = require('express');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const router = express.Router();
const { loginValidator } = require('./validators');

const checkSession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const checkSessionUserType = (reqUserTypes) => (req, res, next) => {
  const user = req.session.user;
  if (user && reqUserTypes.includes(user.user_type)) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
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
    const query = 'SELECT * FROM app_user WHERE username = $1';
    const result = await pool.query(query, [username]);
    
    if (!result || result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
    return res.status(200).json({ message: 'Logout successful' });
  });
});

router.get('/session', checkSession, (req, res) => {
  res.json({ user: req.session.user });
});

router.get('/check-username/:username', async (req, res) => {
  const { username } = req.params;
  const query = 'SELECT * FROM app_user WHERE username = $1';

  try {
    const result = await pool.query(query, [username]);
    res.status(200).json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).send('Error checking username');
  }
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const query = 'INSERT INTO app_user (username, password) VALUES ($1, $2) RETURNING *';

  try {
    const existingUser = await pool.query('SELECT * FROM app_user WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const result = await pool.query(query, [username, password]); // Hash password before storing
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

module.exports = { router, checkSession, checkSessionUserType };
