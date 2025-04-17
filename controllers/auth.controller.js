const pool = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role_id`,
      [username, email, hashedPassword, 3] // default signup role is "user"
    );

    const token = generateToken(newUser.rows[0]);

    res.status(201).json({
      user: newUser.rows[0],
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createUserByAdmin = async (req, res) => {
  const { username, email, password, role_id } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role_id`,
      [username, email, hashedPassword, role_id]
    );

    res.status(201).json({
      message: "User created by admin",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    let result;

    if (req.user.role_id === 1) {
      // Super Admin - get admins and users
      result = await pool.query(
        `SELECT id, username, email, role_id FROM users WHERE role_id IN (2,3)`
      );
    } else if (req.user.role_id === 2) {
      // Admin - get users only
      result = await pool.query(
        `SELECT id, username, email, role_id FROM users WHERE role_id = 3`
      );
    } else {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ users: result.rows });
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signup,
  login,
  createUserByAdmin,
  getUsers,
};
