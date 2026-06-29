const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ message: "All fields (email, password, full_name, role) are required." });
  }

  if (role !== 'seeker' && role !== 'recruiter') {
    return res.status(400).json({ message: "Role must be either 'seeker' or 'recruiter'." });
  }

  try {
    // Check if user exists
    const userExist = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertRes = await db.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email.toLowerCase(), passwordHash, full_name, role]
    );

    const userId = db.getDbType() === 'sqlite' ? insertRes.lastID : insertRes.rows[0].id;

    // Create token
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), role, name: full_name },
      process.env.JWT_SECRET || 'careerswipe_ultra_secure_secret_token_1234',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        email,
        full_name,
        role
      }
    });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ message: "Internal server error during registration." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      process.env.JWT_SECRET || 'careerswipe_ultra_secure_secret_token_1234',
      { expiresIn: '30d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Internal server error during login." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, email, full_name, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(userRes.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Internal server error retrieving profile." });
  }
};
