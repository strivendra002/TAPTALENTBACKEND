import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { pool } from "./db/db.js";
import http from "http";
import { initSocket } from "./socket.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  return res.status(200).json({ message: "Hello Trivendra!" });
});

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = initSocket(server);

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
})();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end().then(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
//   const socket1 = io("http://localhost:5000");
// socket1.on("matched", data => console.log("1 matched", data));
// socket1.on("receive-message", msg => console.log("1 got:", msg));
// socket1.on("partner-left", () => console.log("1 partner left"));
// socket1.emit("find-match");
});
