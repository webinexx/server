const pool = require("../config/db");
const { canViewTicket } = require("../utils/access");

// CREATE TICKET (user only)
const createTicket = async (req, res) => {
  try {
    const { subject } = req.body;
    const { id: userId } = req.user;

    const result = await pool.query(
      "INSERT INTO tickets (user_id, subject) VALUES ($1, $2) RETURNING id",
      [userId, subject]
    );

    res.status(201).json({
      success: true,
      ticket_id: result.rows[0].id,
      message: "Ticket created successfully",
    });
  } catch (error) {
    console.error("Error in createTicket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// SEND MESSAGE (user or admin/superadmin if allowed)
const sendMessage = async (req, res) => {
  const { message } = req.body;
  const ticketId = parseInt(req.params.id);
  const { id: senderId, role_id } = req.user;

  try {
    const ticketRes = await pool.query(
      "SELECT user_id FROM tickets WHERE id = $1",
      [ticketId]
    );
    if (!ticketRes.rowCount) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticketOwnerId = ticketRes.rows[0].user_id;
    const isAuthorized = senderId === ticketOwnerId || [1, 2].includes(role_id);

    if (!isAuthorized) {
      return res.status(403).json({ error: "Access denied" });
    }

    await pool.query(
      "INSERT INTO messages (ticket_id, sender_id, message) VALUES ($1, $2, $3)",
      [ticketId, senderId, message]
    );

    res.status(201).json({ success: true, message: "Message sent" });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// GET MESSAGES (ticket owner or admin/superadmin)
const getMessages = async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { id: userId, role_id } = req.user;

  try {
    // 1. Get the ticket's owner
    const ticketRes = await pool.query(
      "SELECT user_id FROM tickets WHERE id = $1",
      [ticketId]
    );

    if (ticketRes.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticketOwnerId = ticketRes.rows[0].user_id;

    // 2. Check access
    if (!canViewTicket(role_id, userId, ticketOwnerId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // 3. Fetch messages related to that ticket
    const messageRes = await pool.query(
      `SELECT 
        m.message, 
        m.timestamp, 
        u.name AS sender_name, 
        u.role_id
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ticket_id = $1
       ORDER BY m.timestamp ASC`,
      [ticketId]
    );

    res.status(200).json({
      ticket_id: ticketId,
      messages: messageRes.rows,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// UPDATE TICKET STATUS (admin/superadmin only)
const updateTicketStatus = async (req, res) => {
  const { status } = req.body;
  const ticketId = parseInt(req.params.id);
  const { role_id } = req.user;

  if (![1, 2].includes(role_id)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await pool.query("UPDATE tickets SET status = $1 WHERE id = $2", [
      status,
      ticketId,
    ]);
    res.status(200).json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Error in updateTicketStatus:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};
const getAllTickets = async (req, res) => {
  const { id: userId, role_id } = req.user;

  try {
    const result = await pool.query(
      role_id === 3
        ? "SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC"
        : "SELECT * FROM tickets ORDER BY created_at DESC",
      role_id === 3 ? [userId] : []
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error in getAllTickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

module.exports = {
  createTicket,
  sendMessage,
  getMessages,
  updateTicketStatus,
  getAllTickets,
};
