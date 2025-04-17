const express = require("express");
const cors = require("cors"); // ✅ Import cors
require("dotenv").config();

const app = express();

app.use(cors()); // ✅ Allow all origins (you can restrict this later)
app.use(express.json());

const authRoutes = require("./routes/auth.routes");
const ticketRoutes = require("./routes/ticket.routes");
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);
app.use("/api", ticketRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const express = require("express");
// const cors = require("cors");
// const { Pool } = require("pg");

// const app = express();
// const port = 3001;

// app.use(cors());
// app.use(express.json());

// const pool = new Pool({
//   user: "adm",
//   host: "93.127.195.125",
//   database: "mydb",
//   password: "adm*1234",
//   port: 5432,
// });

// // GET all messages
// app.get("/api/messages", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM adm_schema.messages order by id"
//     );
//     console.log("Fetched messages:", result.rows.length);
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching messages:", err);
//     res.status(500).send("DB error");
//   }
// });

// // POST new message
// app.post("/api/messages", async (req, res) => {
//   console.log("POST /api/messages hit 🚀"); // Add this

//   try {
//     const {
//       text,
//       ip,
//       latitude,
//       longitude,
//       city,
//       region,
//       country,
//       countryCode,
//       postal,
//       isp,
//       device,
//     } = req.body;

//     console.log("Raw body:", req.body); // 👈 Add this for debugging

//     if (!text || typeof text !== "string" || text.trim() === "") {
//       return res.status(400).json({ error: "Message text is required" });
//     }

//     const details = {
//       ip,
//       location: {
//         latitude,
//         longitude,
//         city,
//         region,
//         country,
//         countryCode,
//         postal,
//       },
//       isp,
//       device,
//     };

//     console.log("detailsdetails", details); // Should show in terminal now

//     const result = await pool.query(
//       `INSERT INTO adm_schema.messages (text, details)
//        VALUES ($1, $2)
//        RETURNING *`,
//       [text, JSON.stringify(details)]
//     );

//     console.log("Message added:", result.rows[0]);
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error adding message:", err);
//     res.status(500).json({ error: "Failed to add message" });
//   }
// });

// app.delete("/api/messages/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       "DELETE FROM adm_schema.messages WHERE id = $1 RETURNING *",
//       [id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     console.log("Message deleted:", result.rows[0]);
//     res.json({ message: "Deleted successfully", deleted: result.rows[0] });
//   } catch (err) {
//     console.error("Error deleting message:", err);
//     res.status(500).json({ error: "Failed to delete message" });
//   }
// });

// app.put("/api/messages/:id", async (req, res) => {
//   const { id } = req.params;
//   const { text } = req.body;

//   if (!text || typeof text !== "string" || text.trim() === "") {
//     return res.status(400).json({ error: "Message text is required" });
//   }

//   try {
//     const result = await pool.query(
//       "UPDATE adm_schema.messages SET text = $1 WHERE id = $2 RETURNING *",
//       [text, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     console.log("Message updated:", result.rows[0]);
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Error updating message:", err);
//     res.status(500).json({ error: "Failed to update message" });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
