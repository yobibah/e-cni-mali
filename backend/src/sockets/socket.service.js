let io;

const initSocketService = (ioInstance) => {
  io = ioInstance;
};

// envoyer à un user précis
const sendToUser = (userId, event, data) => {
  if (!io) return;

  io.to(`user_${userId}`).emit(event, {
    ...data,
    date: new Date(),
  });
};

// envoyer à tous
const sendToAll = (event, data) => {
  if (!io) return;

  io.emit(event, {
    ...data,
    date: new Date(),
  });
};

// envoyer à un groupe (admin, etc.)
const sendToRoom = (room, event, data) => {
  if (!io) return;

  io.to(room).emit(event, {
    ...data,
    date: new Date(),
  });
};

// export correct CommonJS
module.exports = {
  initSocketService,
  sendToUser,
  sendToAll,
  sendToRoom,
};