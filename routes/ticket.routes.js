const express = require("express");
const router = express.Router();
const {
  createTicket,
  sendMessage,
  getMessages,
  updateTicketStatus,
  getAllTickets,
} = require("../controllers/ticket.controller");
const { verifyToken, checkRole } = require("../middleware/auth");

router.post("/tickets", verifyToken, checkRole(2, 3), createTicket);
router.post(
  "/tickets/:id/messages",
  verifyToken,
  checkRole(1, 2, 3),
  sendMessage
);
router.get(
  "/tickets/:id/messages",
  verifyToken,
  checkRole(1, 2, 3),
  getMessages
);
router.patch(
  "/tickets/:id/status",
  verifyToken,
  checkRole(1, 2, 3),
  updateTicketStatus
);
// GET all tickets
router.get("/tickets", verifyToken, checkRole(1, 2, 3), getAllTickets);

module.exports = router;
