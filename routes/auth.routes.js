const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken, checkRole } = require("../middleware/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Super Admin (1) or Admin (2) can create users
router.post(
  "/create-user",
  verifyToken,
  checkRole(1, 2),
  authController.createUserByAdmin
);

// View users (role-based logic inside controller)
router.get("/users", verifyToken, checkRole(1, 2), authController.getUsers);

module.exports = router;
