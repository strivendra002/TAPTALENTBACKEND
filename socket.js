import { Server } from "socket.io";
import { handleFindMatch } from "./handlers/match.handler.js";
import { handleMessage } from "./handlers/message.handler.js";
import { handleSkip } from "./handlers/skip.handler.js";
import { handleDisconnect } from "./handlers/disconnect.handler.js";
import { handleConnect } from "./handlers/connection.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    handleConnect(socket).catch(error => {
      console.error("Error in handleConnect:", error);
    });

    socket.on("find-match", () => {
      handleFindMatch(socket, io).catch(error => {
        console.error("Error in find-match:", error);
        socket.emit("error", "Failed to find match");
      });
    });

    socket.on("send-message", (data) => {
      handleMessage(socket, io, data).catch(error => {
        console.error("Error in send-message:", error);
        socket.emit("error", "Failed to send message");
      });
    });

    socket.on("skip-chat", () => {
      handleSkip(socket, io).catch(error => {
        console.error("Error in skip-chat:", error);
        socket.emit("error", "Failed to skip chat");
      });
    });

    socket.on("disconnect", () => {
      handleDisconnect(socket, io).catch(error => {
        console.error("Error in disconnect:", error);
      });
    });
  });

  return io;
};