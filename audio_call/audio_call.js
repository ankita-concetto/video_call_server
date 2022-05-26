var constants = require("../constants.js");

let channels = []

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}
exports.manage = async (data, connection, request, users) => {
    switch (data.type) {

        case constants.startCall:
            let channelName = data.data[constants.channelName]
            let userId = data.data[constants.userId]
            if (channelName != null && userId != null) {
                if (channels.includes(channelName) && !channels[channelName].hasOwnProperty(userId)) {
                    var listOfUserId = channels[channelName]
                    listOfUserId.push(userId)
                    channels[channelName] = listOfUserId
                    audioCallStarted(connection, channelName, userId)
                } else if (!channels.includes(channelName)) {
                    channels[channelName] = [userId]
                    audioCallStarted(connection, channelName, userId)
                } else {
                    sendTo(connection, {
                        type: constants.userAlreadyAdded,
                        data: { 'success': false }
                    });
                }
            } else {
                sendTo(connection, {
                    type: constants.failedToJoinAudioCall,
                    data: { 'success': false }
                });
            }
            break;

        case constants.notifyUsers:
            let channelName2 = data.data[constants.channelName]
            let userId2 = data.data[constants.userId]
            notifyUsers(channelName2, userId2, users)
            break;

        case constants.candidate:
            let candidateConnection = users[data.data[constants.toUserId]];

            if (candidateConnection != null) {
                console.log('candidate');
                sendTo(candidateConnection, {
                    type: "candidate",
                    data: data.data
                });
            }
            break;
        case constants.offer:

            let offerConn = users[data.data[constants.toUserId]];

            if (offerConn != null) {
                console.log('offer');
                sendTo(offerConn, {
                    type: "offer",
                    data: data.data,
                });
            }

            break;
        case constants.answer:
            let answerConnection = users[data.data[constants.toUserId]];

            if (answerConnection != null) {
                console.log('answer');
                sendTo(answerConnection, {
                    type: "answer",
                    data: data.data
                });
            }

            break;
        case constants.bye:
            let userId3 = data.data[constants.fromUserId];
            let channelName3 = data.data[constants.channelName];
            removeUser(userId3, channelName3, users)
            break;
    }
}

function audioCallStarted(connection, channelName, userId) {
    sendTo(connection, {
        type: constants.audioCallStarted,
        data: { 'success': true, 'channelName': channelName, 'userId': userId }
    });
}

function notifyUsers(channelName, userID, users) {
    for (const index in channels[channelName]) {
        if (channels[channelName][index] != userID) {
            var userConnection = users[channels[channelName][index]]
            sendTo(userConnection, {
                type: constants.newUserAdded,
                data: { 'userId': userID }
            });
        }
    }
}

function removeUser(userId, channelName, users) {
    for (const index in channels[channelName]) {
        if (channels[channelName][index] != userID) {
            var userConnection = users[channels[channelName][index]]
            sendTo(userConnection, {
                type: constants.removeUser,
                data: { 'userId': userId }
            });
        }
    }
}