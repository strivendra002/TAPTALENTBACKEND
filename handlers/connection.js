import { pool } from "../db/db.js";


export const handleConnect = async (socket) => {
  try {
    await pool.query(
      "DELETE FROM users WHERE connection_id = $1",
      [socket.id]
    );

    await pool.query(
      `
      INSERT INTO users (connection_id, status)
      VALUES ($1, 'idle')
      `,
      [socket.id]
    );

    console.log("✅ User connected (idle):", socket.id);
  } catch (error) {
    console.error("❌ Error in handleConnect:", error);
  }
};