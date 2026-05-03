import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("setup", (userId) => {
      socket.join(userId);
      socket.emit("connected");
    });

    socket.on("join chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("new message", (message) => {
      const users = message.chat.users;

      users.forEach((user) => {
        if (user._id === message.sender._id) return;

        io.to(user._id).emit("message received", message);
      });
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};
