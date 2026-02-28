import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ connected:", socket.id);
  socket.emit("find-match");
});

socket.on("matched", (data) => {
  console.log("🎯 matched:", data);

  socket.emit("send-message", {
    chatId: data.chatId,
    message: "Hello from test client",
  });
});

socket.on("receive-message", (msg) => {
  console.log("💬 received:", msg);
});

socket.on("partner-left", () => {
  console.log("❌ partner left");
});