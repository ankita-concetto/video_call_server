const server = require('http').createServer()
const io = require('socket.io')(server)
const constants = require("./constants.js");
const audioCall = require("./audio_call/audio_call.js");
let users = []

io.on('connection', function (client) {

  console.log('client connect...', client.id);
  
  let connection = client.conn;
  
  client.on('message', function name(message) {
    console.log('data received -->', message);

    //{"type":"addUser","message":{"userId": "3"}}

    io.emit('message', message);
    
    // process socket io message
    manageIncomingData(message, connection, client)
   
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
          var userId = data.message.userId; 
          users[userId] = connection;
          request.name = userId;
          sendTo(request,{'type' : constants.addUser,'data' : {'result' : 'success'}})
          break;
      case constants.startCall:
          audioCall.manage(data, connection, request,users, io)
          break;
  }
}

function sendTo(client, msg) {
  
    //var detail = JSON.parse(msg);
    io.to(client.id).emit('fromServer', "Connection is live now.");
    
    }

//.on means andriod mathi aavse ane .emit means jase


