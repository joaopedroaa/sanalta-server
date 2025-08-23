// server.js

import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import {
  userJoinGroup,
  formatMessage,
  botName,
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
  socket.on("userJoinGroup", ({ username, group, type }) => {


    const user = userJoinGroup({ username, group, id: socket.id, type });
    socket.join(user.group);

    socket.emit("chatHistory", getGroupMessages(user.group));

    // Notificando de que o usuario entrou
    socket.broadcast
      .to(user.group)
      .emit(
        "message",
        formatMessage(botName, `🚀 ${user.username} entrou na sala`)
      );

    // Envia historico para o front

    io.to(user.group).emit("groupData", {
      group: user.group,
      users: getGroupUsers(user.group),
    });
  });

  socket.on("getGroup", () => {
    socket.emit("groupList", getGroupData());
  });



  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    if (user) {
      const formattedMessage = {
        ...formatMessage(user.username, msg),
        group: user.group,
      };

      saveMessage(formattedMessage);
      io.to(user.group).emit("message", formattedMessage);
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.group).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      io.to(user.group).emit("groupData", {
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
