const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("join_room", (roomId) => {
      console.log("join_room");
      //socket.join(roomId);
      //socket.to(roomId).broadcast.emit("join_room", roomId);
  });

  socket.on("message", (message) => {
    io.to(roomId).emit("message", message);
  });

  socket.on("typing", (message) => {
    io.to(roomId).emit("typing", message);
  });

});



server.listen(process.env.PORT || 3000);