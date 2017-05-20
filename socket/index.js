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
    GET_PLAYER_ID_BY_PLAYER_NUMBER_QUERY,
    GAME_FULL_QUERY,
    GET_PLAYER_CARDS_BY_PLAYER_ID_QUERY,
    GO_FISH_QUERY,
    GET_CARDS_LEFT_IN_DECK_QUERY,
    FIND_BOOKS_IN_HAND_QUERY,
    MOVE_BOOK_OUT_OF_HAND_QUERY,
    CHECK_FOR_REQUESTED_CARDS_QUERY,
    MOVE_CARDS_TO_REQUESTING_PLAYER_QUERY,
    GET_PLAYER_TURN_QUERY,
    ADD_PLAYER_CHANNEL_TO_PLAYERS_QUERY
} = require('../src/constants/DBConstants')

const init = (app, server) => {
    const io = socketIo(server)
    app.set('io', io)

    io.on('connection', socket => {
        socket.on('disconnect', data => {
            console.log('client disconnected')
        })

        socket.on(USER_JOINED, data => io.emit(USER_JOINED, data))
        socket.on(MESSAGE_SEND, data => io.emit(MESSAGE_SEND, data))

        socket.on('GAME_USER_JOINED', function(data){
          socket.join(data.gameID)
          console.log("chat test ", data.gameID)
          io.sockets.in(data.gameID).emit('GAME_USER_JOINED', data)
        })

        socket.on('GAME_MESSAGE_SEND', function(data){
          io.sockets.in(data.gameID).emit('GAME_MESSAGE_SEND', data)
        })

        socket.on('JOIN_GAME', initializeGameSockets)

        socket.on('START_GAME', function(userPackage) {
            io.sockets.in(userPackage.gameID).emit('STARTING_GAME', userPackage);
        })

        socket.on('GET_HAND', getHand)

        socket.on('REQUEST_CARD', requestCard)

        socket.on('REFRESH_HAND', getHand)

        socket.on('GO_FISH', goFish)

        socket.on('GET_TURN_STATUS', getTurnStatus)

        function initializeGameSockets(userPackage) {
            socket.join(userPackage.gameID);
            socket.join(userPackage.playerChannel);

            const dealCardQuery = `UPDATE cards_in_play SET player_id = $1 WHERE card_id IN
                                    (SELECT card_id FROM cards_in_play WHERE game_id = $2
                                      AND player_id = -1 ORDER BY random() LIMIT 7)`;
            database.none(dealCardQuery, [userPackage.playerID, userPackage.gameID])

            database.none(ADD_PLAYER_CHANNEL_TO_PLAYERS_QUERY, [userPackage.playerChannel, userPackage.playerID,
                          userPackage.gameID])

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

                    io.sockets.in(userPackage.playerChannel).emit('SEND_CARDS', hand);
                })
                .catch(function(error) {
                    console.log("ERROR:", error);
                });
        }

        function requestCard(userPackage) {
            var rCard = userPackage.rCard;
            var rPlayer = userPackage.rPlayer;
            var gameID = userPackage.gameID;

            database.any(CHECK_FOR_REQUESTED_CARDS_QUERY, [gameID, rCard, gameID, rPlayer])
              .then(function(data){
                if (data != null && data.length > 0){
                  console.log("cards found!");
                  getRequestedCards(userPackage);
                } else {
                  console.log("cards not found!");
                  io.sockets.in(userPackage.playerChannel).emit('NEED_TO_GO_FISH', userPackage);
                }
              })

        }

        function getRequestedCards(userPackage){
          var rCard = userPackage.rCard;
          var rPlayer = userPackage.rPlayer;
          var gameID = userPackage.gameID;
          var playerID = userPackage.playerID;

          database.none(MOVE_CARDS_TO_REQUESTING_PLAYER_QUERY, [playerID, gameID, rCard, gameID, rPlayer]);

          io.sockets.in(userPackage.playerChannel).emit('REFRESH_CURR_PLAYER_CARDS', userPackage);
          var test = 'wee';
          io.sockets.in(userPackage.gameID).emit('REFRESH_ALL_PLAYERS_HANDS', test);

        }

        function goFish(userPackage){
          var gameID = userPackage.gameID;
          var playerID = userPackage.playerID;

          database.none(GO_FISH_QUERY, [playerID, gameID]);

          io.sockets.in(userPackage.playerChannel).emit('GO_FISH_RESULT', userPackage);
          io.sockets.in(userPackage.gameID).emit('INCREMENT_CURRENT_PLAYER_TURN', 'wee');
        }

        function getTurnStatus(userPackage){
          io.sockets.in(userPackage.gameID).emit('SEND_TURN_STATUS', 'wee');
        }
    })
}

module.exports = {
    init
}
