import { pool } from "../db/db.js";

export const handleDisconnect = async (socket, io) => {
  try {
    const user = await pool.query(
      "SELECT id FROM users WHERE connection_id = $1",
      [socket.id]
    );

    if (!user.rows.length) {
      console.log("User not found in database:", socket.id);
      return;
    }

    const userId = user.rows[0].id;

    await pool.query(
      `UPDATE chat_sessions
       SET ended_at = NOW(), ended_by = $1
       WHERE ended_at IS NULL
       AND ($1 IN (user1_id, user2_id))`,
      [userId]
    );

    const partner = await pool.query(
      `SELECT u.connection_id
       FROM chat_sessions c
       JOIN users u ON (u.id = c.user1_id OR u.id = c.user2_id)
       WHERE c.ended_at IS NULL
       AND u.id != $1
       AND ($1 IN (c.user1_id, c.user2_id))`,
      [userId]
    );

    if (partner.rows.length) {
      io.to(partner.rows[0].connection_id).emit("partner-left");
    }

    await pool.query("DELETE FROM users WHERE connection_id = $1", [socket.id]);
    console.log("❌ User disconnected:", socket.id);
  } catch (error) {
    console.error("❌ Error in handleDisconnect:", error);
  }
};