const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // user: { id, email, role_id }
    next();
  });
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("User Role ID:", req.user.role_id); // 👈 debug
    console.log("Allowed Roles:", allowedRoles); // 👈 debug

    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
