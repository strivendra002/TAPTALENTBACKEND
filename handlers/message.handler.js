import { pool } from "../db/db.js";

export const handleMessage = async (socket, io, { chatId, message }) => {
  if (!message || message.length > 500) return;

  const userRes = await pool.query(
    "SELECT id FROM users WHERE connection_id = $1",
    [socket.id]
  );
  if (!userRes.rows.length) return;

  const userId = userRes.rows[0].id;

  const chatRes = await pool.query(
    `
    SELECT user1_id, user2_id
    FROM chat_sessions
    WHERE id = $1 AND ended_at IS NULL
    `,
    [chatId]
  );

  if (!chatRes.rows.length) return;

  const { user1_id, user2_id } = chatRes.rows[0];

  const partnerId = user1_id === userId ? user2_id : user1_id;

  const partnerRes = await pool.query(
    "SELECT connection_id FROM users WHERE id = $1",
    [partnerId]
  );

  if (!partnerRes.rows.length) return;

  io.to(partnerRes.rows[0].connection_id).emit(
    "receive-message",
    message
  );
};