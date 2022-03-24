const videoCall = require("./video_call/video_call.js");
const constants = require("./constants.js");
const webSocket = require("websocket");
const http = require("http");
let WebSocketServer = webSocket.server;
let users = []
let server = http.createServer(function (request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(3000, function () {
});

// create the server
let wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function (request) {
    let connection = request.accept(null, request.origin);
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            manageIncomingData(message.utf8Data, connection, request)
        }
    });

    connection.on('close', function (connection) {
        // close user connection
        if (request.name) {
            console.log("closing")
            delete users[request.name]
        }
    });
});

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}

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
    }
}