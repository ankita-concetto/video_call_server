const server = require('http').createServer()
const io = require('socket.io')(server)

io.on('connection', function (client) {

  console.log('client connect...', client.id);
  //console.log('client connect --->...', client.request.ha);

  client.on('message', function name(data) {
    console.log(data);
    io.emit('message', data)
  })

  client.on('connect', function () {
    console.log('connection established');
  })

  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
    // handleDisconnect()
  })

  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
})

var server_port = 3000;
server.listen(server_port, function (err) {
  if (err) throw err
  console.log('Listening on port %d', server_port);
});

function manageIncomingData(message, connection, request) {
  let data
  //accepting only JSON messages
  try {
      data = JSON.parse(message);
      console.log(data);
  } catch (e) {
      console.log("Invalid JSON");
      return;
  }
  switch (data.type) {
      case constants.addUser:
    var userId = data.message[constants.userId]
          users[userId] = connection
          request.name = userId;
          sendTo(connection,{'type' : constants.addUser,'data' : {'result' : 'success'}})
          break;
      case constants.videoCall:
    videoCall.manage(data.message, connection, request,users)
          break;
      case constants.audioCall:
          audioCall.manage(data.message, connection, request,users)
          break;
  }
}