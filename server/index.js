// server.js

import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import {
  addUserToGroup,
  removeUserToGroup,
  createMessage,
  getUserById,
  getUsersInGroup,
  addMessageToGroup,
  getMessagesFromGroup,
} from "./groupServices.js";

import { addUserToRoom } from "./roomServices.js";
import { systemBotName } from "./utils.js";
import { log } from "console";

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
    const user = addUserToGroup({ id: socket.id, username, group, type });
    socket.join(user.group);

    const notificationMessage = createMessage(
      `${user.username} entrou no grupo`,
      systemBotName,
      "system"
    );

    addMessageToGroup(notificationMessage, user.group);
    socket.emit("chat_history_load", getMessagesFromGroup(user.group));

    // Notificando de que o usuario entrou para todos (menos para o prorio usuario)
    socket.broadcast
      .to(user.group)
      .emit("chat:new_notification", notificationMessage);

    // Envia historico para o front
    io.to(user.group).emit("group:users_update", {
      group: user.group,
      users: getUsersInGroup(user.group),
    });
  });

  socket.on("chat:post_message", (msg) => {
    const user = getUserById(socket.id);

    if (user) {
      const userMessage = createMessage(msg, user.username);

      addMessageToGroup(userMessage, user.group);
      io.to(user.group).emit("chat:new_message", userMessage);
    }
  });

  socket.on("group:leave", () => {
    // Salvando antes para não perder o user.group
    const user = removeUserToGroup(socket.id);

    if (user) {
      const notificationMessage = createMessage(
        `${user.username} saiu do grupo`,
        systemBotName,
        "system"
      );

      addMessageToGroup(notificationMessage, user.group);
      io.to(user.group).emit("chat:new_notification", notificationMessage);
      io.to(user.group).emit("group:users_update", {
        group: user.group,
        users: getUsersInGroup(user.group),
      });
    }
  });

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  socket.on("room:join", ({ username, type }) => {
    console.log("room:join", { username, type });

    const user = addUserToRoom({ id: socket.id, username, type });
    socket.join(user.group);
  });
});

const PORT = 3001 || process.env.PORT;

server.listen(PORT, () => {
  console.log("Server is running: ", PORT);
});
