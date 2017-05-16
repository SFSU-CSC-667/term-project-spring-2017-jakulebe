const socketIo = require('socket.io')
var {
    database
} = require('../database/database');
const {
    USER_JOINED,
    MESSAGE_SEND
} = require('../src/constants/events')
const {
    GET_PLAYER_NAME_BY_ID_QUERY,
    GET_PLAYER_ID_BY_NAME_QUERY,
    GET_PLAYER_NUMBER_BY_ID_QUERY,
    GET_PLAYER_NUMBER_BY_NAME_QUERY,
    GAME_FULL_QUERY,
    GET_PLAYER_CARDS_BY_PLAYER_ID_QUERY,
    GO_FISH_QUERY,
    GET_CARDS_LEFT_IN_DECK_QUERY,
    FIND_BOOKS_IN_HAND_QUERY,
    MOVE_BOOK_OUT_OF_HAND_QUERY,
    CHECK_FOR_REQUESTED_CARDS_QUERY,
    MOVE_CARDS_TO_REQUESTING_PLAYER_QUERY
} = require('../src/constants/DBConstants')

const init = (app, server) => {
    const io = socketIo(server)
    app.set('io', io)

    io.on('connection', socket => { //Global socket connection
        console.log('client connected')

        //Global socket connection
        socket.on('disconnect', data => {
            console.log('client disconnected')
        })

        //LOBBY CHAT
        socket.on(USER_JOINED, data => io.emit(USER_JOINED, data))
        socket.on(MESSAGE_SEND, data => io.emit(MESSAGE_SEND, data))

        //GAMEROOM SOCKETS
        socket.on('JOIN_GAME', initializeGameSockets)

        socket.on('START_GAME', function(userPackage) {
            io.sockets.in(userPackage.gameID).emit('STARTING_GAME', userPackage);
        })

        socket.on('GET_HAND', getHand)

        function initializeGameSockets(userPackage) {
            console.log("joining game: ", userPackage.gameID);
            console.log("player channel: ", userPackage.playerChannel);

            socket.join(userPackage.gameID);
            socket.join(userPackage.playerChannel);

            io.sockets.in(userPackage.gameID).emit('TEST', userPackage);
            io.sockets.in(userPackage.playerChannel).emit('PLAYER_TEST', userPackage);

            database.oneOrNone(GAME_FULL_QUERY, [userPackage.gameID])
                .then(function(data) {
                    if (data.max_players == data.current_players) {
                        io.sockets.in(userPackage.gameID).emit('START_GAME_BUTTON', userPackage);
                    }
                })
                .catch(function(error) {
                    console.log("ERROR:", error);
                });
        }

        function getHand(userPackage) {
            var hand = [];
            database.any(GET_PLAYER_CARDS_BY_PLAYER_ID_QUERY, [userPackage.gameID, userPackage.playerID])
                .then(function(data) {
                    for (var index = 0; index < data.length; index++) {
                        var card = new Object();
                        card.card_id = data[index].card_id;
                        card.card_name = data[index].card_name;
                        //console.log("card = ", card.card_name);
                        card.value = data[index].value;
                        hand[index] = card;
                    }
                    userPackage.hand = hand;
                    console.log("hand length = ", hand.length);
                    var cardString = 'cards = '; //this is for testing purposes only
                    for (var index = 0; index < hand.length; index++) {
                        cardString += hand[index].card_name.toString();
                        cardString += ' ';
                        //console.log("card string = ", cardString);
                    }
                    //will normally send the array of cards to client and client will
                    //use that to process and display cards
                    io.sockets.in(userPackage.playerChannel).emit('SEND_CARDS', cardString);
                })
                .catch(function(error) {
                    console.log("ERROR:", error);
                });
        }
        function goFish(userPackage) {

        }


    })
}

module.exports = {
    init
}
