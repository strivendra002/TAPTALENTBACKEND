import { pool } from "../db/db.js";

export const handleSkip = async (socket, io) => {
  const userRes = await pool.query(
    "SELECT id FROM users WHERE connection_id = $1",
    [socket.id]
  );
  if (!userRes.rows.length) return;

  const userId = userRes.rows[0].id;

  // Find active chat
  const chatRes = await pool.query(
    `
    SELECT id, user1_id, user2_id
    FROM chat_sessions
    WHERE ended_at IS NULL
    AND ($1 = user1_id OR $1 = user2_id)
    `,
    [userId]
  );

  if (!chatRes.rows.length) return;

  const chat = chatRes.rows[0];
  const partnerId =
    chat.user1_id === userId ? chat.user2_id : chat.user1_id;

  // ❗ End chat
  await pool.query(
    `
    UPDATE chat_sessions
    SET ended_at = now(), ended_by = $1
    WHERE id = $2
    `,
    [userId, chat.id]
  );

  // ❗ Reset BOTH users to searching
  await pool.query(
    `
    UPDATE users
    SET status = 'searching'
    WHERE id IN ($1, $2)
    `,
    [userId, partnerId]
  );

  // Notify partner
  const partnerRes = await pool.query(
    "SELECT connection_id FROM users WHERE id = $1",
    [partnerId]
  );

  if (partnerRes.rows.length) {
    io.to(partnerRes.rows[0].connection_id).emit("partner-left");
  }
};