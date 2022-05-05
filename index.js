const express = require("express");
var http = require("http");
const internal = require("stream");
const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);
var io = require("socket.io")(server);

//middlewre
app.use(express.json());
var clients = {};

io.on("connection", (socket) => {
  console.log("connetetd");
  
  console.log(socket.id, "has joined");

  socket.on("signin", (id) => {
    clients[socket.json['handshake']['query']['id']] = socket;
      console.log(clients);
  });

  socket.on("groupMessage", (msg) => {
    console.log(msg);
    var userId = msg.userId;
    Object.keys(clients).forEach(key => {
      console.log(key, clients[key]);
      if (key!=clients[parseInt( userId, 10 )]) clients[parseInt( userId, 10 )].emit("message", msg);
    });
    
  });

  socket.on("message", (msg) => {
    console.log(msg);
    var targetId = msg.targetId;
    if (clients[parseInt( targetId, 10 )]) clients[parseInt( targetId, 10 )].emit("message", msg);
  });

});

server.listen(port,  () => {
  console.log("server started");
});