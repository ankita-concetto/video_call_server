const videoCall = require("./video_call/video_call.js");
const constants = require("./constants.js");
const webSocket = require("websocket");
const http = require("http");
const { type } = require("os");
let WebSocketServer = webSocket.server;
var connections = new Map();
let server = http.createServer(function (request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(3000, function () {
    console.log('server.listen');
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
        console.log('connection close');
        // close user connection
        if (request.name) {
            console.log("closing")
            // delete users[request.name]
            let sendConn = connections.get(request.name);
            if(sendConn){
                sendTo(sendConn,{'type' : constants.userStatus,'data' : {'userId' : request.name, 'userStatus' : ''+Math.floor(new Date().getTime())}})
                delete sendConn;
                console.log('connection size before delete: '+connections.size);
                connections.delete(request.name);
                console.log('connection size after delete: '+connections.size);
            }
        }
    });
});

function sendTo(connection, message) {
    console.log(message);
    connection.send(JSON.stringify(message));
}

function manageIncomingData(message, connection, request) {
    let data
    //accepting only JSON messages
    try {
        data = JSON.parse(message);
        console.log('data:');
        console.log(data);
    } catch (e) {
        console.log("Invalid JSON");
        return;
    }
    console.log('type: '+data.type);
    switch (data.type) {
        case constants.addUser:
            var messageData = JSON.parse(data.message);
			var userId = messageData.userId;
            connections.set(userId,connection);
            request.name = userId;
            sendTo(connection,{'type' : constants.addUser,'data' : {'result' : 'success'}})
            console.log('connections size: '+connections.size);

            break;


        case constants.videoCall:
			videoCall.manage(data.message, connection, request,connections)
            break;

        case constants.chat:
            //sendTo(connection,{'type':constants.chat, 'data': {'result':'success'}})
            
            var messageData = JSON.parse(data.message);
            var toUserId = messageData.toUserId;
            var fromUserId = messageData.fromUserId;
            console.log('TouserId: '+toUserId+"  fromUserId:"+fromUserId);
            let conn = connections.get(toUserId);
            if(conn){
                console.log('send userstatus toUser');
                sendTo(conn,{'type' : constants.userStatus,'data' : {'userId': toUserId, 'userStatus': "Online"}});
            }
            break;
        
        case constants.userStatus:
        case constants.sendMessage:
            //console.log('connections is'+JSON.stringify(connection));
            var messageData = JSON.parse(data.message);
            var userId = messageData.userId;
            console.log('userId: '+userId);
            console.log('connection size: '+connections.size);
            let sendConn = connections.get(userId);

            if(data.type == constants.sendMessage) {
                if(messageData.messageStatus == constants.sent){
                    sendTo(connection, {'type': constants.messageStatus, 'data': {
                        'userId': userId,
                        'senderId': messageData.senderId,
                        'message':messageData.message,
                        'messageId' : messageData.messageId,
                        'messageStatus' : constants.delivered
                    }});
                }
            }

            if(sendConn){
                console.log('inside sendconn');
                sendTo(sendConn, {'type': data.type, 'message': data.message});
                if(data.type==constants.sendMessage){
                    if(messageData.messageStatus == constants.sent){
                        sendTo(connection, {'type': constants.messageStatus, 'data': {
                            'userId': userId,
                            'senderId': messageData.senderId,
                            'message':messageData.message,
                            'messageId' : messageData.messageId,
                            'messageStatus' : constants.received
                        }});
                    }
                }
            }
            break;

        case constants.messageStatus:
            var messageData = JSON.parse(data.message);
            var userId = messageData.userId;
            console.log('userId: '+userId);
            console.log('connection size: '+connections.size);
            let messageStatusConn = connections.get(userId);
            if(messageStatusConn){
                console.log('inside messageStatusConn');
                sendTo(messageStatusConn, {'type': data.type, 'message': data.message});
            }
            break;
    }
}