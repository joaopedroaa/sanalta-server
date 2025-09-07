// server.js

import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import {
  userJoinGroup,
  formatMessage,
  systemBotName,
  getGroupUsers,
  userLeave,
  getCurrentUser,
  saveMessage,
  getGroupMessages,
} from "./utils.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("group:join", ({ username, group, type }) => {
    const user = userJoinGroup({ username, group, id: socket.id, type });
    socket.join(user.group);

    const notificationMessage = {
      ...formatMessage(
        systemBotName,
        `${user.username} entrou no grupo`,
        "join"
      ),
      group: user.group,
    };

    saveMessage(notificationMessage);
    socket.emit("chat_history_load", getGroupMessages(user.group));

    // Notificando de que o usuario entrou para todos (menos para o prorio usuario)
    socket.broadcast
      .to(user.group)
      .emit("chat:new_notification", notificationMessage);

    // Envia historico para o front
    io.to(user.group).emit("group:users_update", {
      group: user.group,
      users: getGroupUsers(user.group),
    });
  });

  socket.on("chat:post_message", (msg) => {
    const user = getCurrentUser(socket.id);

    if (user) {
      const userMessage = {
        ...formatMessage(user.username, msg),
        group: user.group,
      };

      saveMessage(userMessage);
      io.to(user.group).emit("chat:new_message", userMessage);
    }
  });

  socket.on("group:leave", () => {
    // Salvando antes para não perder o user.group
    const user = userLeave(socket.id);

    if (user) {
      const notificationMessage = {
        ...formatMessage(
          systemBotName,
          `${user.username} saiu do grupo`,
          "left"
        ),
        group: user.group,
      };

      saveMessage(notificationMessage);
      io.to(user.group).emit("chat:new_notification", notificationMessage);
      io.to(user.group).emit("group:users_update", {
        group: user.group,
        users: getGroupUsers(user.group),
      });
    }
  });
});

const PORT = 3001 || process.env.PORT;

server.listen(PORT, () => {
  console.log("Server is running: ", PORT);
});
