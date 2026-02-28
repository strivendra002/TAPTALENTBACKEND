import { pool } from "../db/db.js";

export const handleFindMatch = async (socket, io) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get current user
    const userRes = await client.query(
      "SELECT id FROM users WHERE connection_id = $1",
      [socket.id]
    );
    if (!userRes.rows.length) {
      await client.query("ROLLBACK");
      return;
    }

    const userId = userRes.rows[0].id;

    const updated = await client.query(
      `
      UPDATE users
      SET status = 'searching'
      WHERE id = $1 AND status = 'idle'
      RETURNING id
      `,
      [userId]
    );

    if (!updated.rows.length) {
      await client.query("ROLLBACK");
      return;
    }

    // Find another searching user (not self)
    const matchRes = await client.query(
      `
      SELECT id, connection_id
      FROM users
      WHERE status = 'searching'
        AND id != $1
      ORDER BY connected_at
      LIMIT 1
      `,
      [userId]
    );

    if (!matchRes.rows.length) {
      await client.query("COMMIT");
      socket.emit("status", "searching");
      return;
    }

    const partner = matchRes.rows[0];

    // Lock partner as chatting (ONLY if still searching)
    const partnerUpdate = await client.query(
      `
      UPDATE users
      SET status = 'chatting'
      WHERE id = $1 AND status = 'searching'
      RETURNING id
      `,
      [partner.id]
    );

    if (!partnerUpdate.rows.length) {
      // Partner state changed → abort
      await client.query("ROLLBACK");
      return;
    }

    // Lock current user as chatting
    await client.query(
      "UPDATE users SET status = 'chatting' WHERE id = $1",
      [userId]
    );

    // Create chat session
    const chatRes = await client.query(
      `
      INSERT INTO chat_sessions (user1_id, user2_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, partner.id]
    );

    await client.query("COMMIT");

    // ✅ Emit matched ONLY after successful commit
    socket.emit("matched", { chatId: chatRes.rows[0].id });
    io.to(partner.connection_id).emit("matched", {
      chatId: chatRes.rows[0].id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in find-match:", err);
  } finally {
    client.release();
  }
};