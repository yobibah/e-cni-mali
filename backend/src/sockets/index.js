const { Server } = require("socket.io");
const {initSocketService} = require("./socket.service")
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    //  rejoindre room user
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  //  injecter io dans le service
  initSocketService(io);

  return io;
};
module.exports = initSocket;