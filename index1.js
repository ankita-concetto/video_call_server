const express = require("express");
var http = require("http");
const internal = require("stream");
const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);
var io = require("socket.io")(server);

app.use(express.json());
var clients = {};
var userConnection = [];

io.on("connection", (socket) => {

  socket.on("addUser", (data) => {
    var other_users = userConnection.filter(p=> p.meeting_id == data.meetingId);
    // data saves to userConnection variable
    // connection id and socket id are same
    userConnection.push({
        connectionId: socket.id,
        user_id: data.currentUserId,
        meeting_id: data.meetingId,
    })
  });

});

server.listen(port,  () => {
  console.log("server started");
});