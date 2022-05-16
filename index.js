const io = require('socket.io')();
io.on('connection', socket => {
  console.log("connected");

  socket.on('join_room', (roomId) => {
    console.log(roomId);
    socket.join(roomId);
    io.emit('join_room', roomId);
  });

});
io.listen(3000);
