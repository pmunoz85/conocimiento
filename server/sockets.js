const socketController = (socket) => {
  console.log('Cliente contectado con del ID:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado con el ID:', socket.id);
  });

  socket.on('mensaje', (payload, callback) => {
    if (callback) {
      callback(socket.id);
    }
    socket.broadcast.emit('mensaje', payload);
  });
};

module.exports = {
  socketController,
};
