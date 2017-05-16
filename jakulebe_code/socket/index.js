const socketIo = require( 'socket.io' )
var {database} = require('../database/database');
const { USER_JOINED, MESSAGE_SEND } = require( '../src/constants/events' )


const getPlayerCardsByPlayerIDQuery = `SELECT * FROM cards_in_play WHERE game_id = $1 AND player_id = $2`;
const goFishQuery = `UPDATE cards_in_play SET player_id = $1 WHERE card_id IN
                     (SELECT card_id FROM cards_in_play WHERE game_id = $2
                      AND player_id = -1 ORDER BY random() LIMIT 1)`;

const getCardsLeftInDeckQuery = `SELECT count(*) FROM cards_in_play WHERE game_id = $1 AND player_id = -1`;

const findBooksInHandQuery = `SELECT value, count(value) FROM cards_in_play WHERE game_id = $1
                              AND player_id = $2 GROUP BY value HAVING count(value) = 4`;

//if books are found, set player_id of books to -2;
const moveBookOutOfHandQuery = `UPDATE cards_in_play SET player_id = -2 WHERE card_id IN
                                (SELECT card_id FROM cards_in_play WHERE game_id = $1
                                AND player_id = $2 AND value = $3)`;

//Query to see if target player has desired cards
const checkForRequestedCardsQuery = `SELECT * FROM cards_in_play WHERE player_id = $1
                                    AND game_id = $2 AND value = $3`;

const init = ( app, server ) => {
  const io = socketIo( server )

  app.set( 'io', io )



  io.on( 'connection', socket => {
    console.log( 'client connected' )


    socket.on( 'disconnect', data => {
      console.log( 'client disconnected' )
    })

    socket.on( USER_JOINED, data => io.emit( USER_JOINED, data ))
    socket.on( MESSAGE_SEND, data => io.emit( MESSAGE_SEND, data ))


    socket.on('JOIN_GAME', initializeGameSockets)

    socket.on('START_GAME', function(userPackage){

      io.sockets.in(userPackage.gameID).emit('STARTING_GAME', userPackage);
    })

    socket.on('GET_HAND', getHand)

    function initializeGameSockets(userPackage){
        console.log("joining game: ", userPackage.gameID);
        console.log("player channel: ", userPackage.playerChannel);

        socket.join(userPackage.gameID);
        socket.join(userPackage.playerChannel);

        io.sockets.in(userPackage.gameID).emit('TEST', userPackage );
        io.sockets.in(userPackage.playerChannel).emit('PLAYER_TEST', userPackage);

        const gameFullQuery = `SELECT * FROM Games WHERE game_id = $1`;

        database.oneOrNone(gameFullQuery, [userPackage.gameID])
          .then(function(data){
            if (data.max_players == data.current_players){

              io.sockets.in(userPackage.gameID).emit('START_GAME_BUTTON', userPackage );
            }
          })
          .catch(function(error) {
            console.log("ERROR:",error);
          });
        }

    function getHand(userPackage){

      var hand = [];
      //const getPlayerCardsByPlayerIDQuery = `SELECT * FROM cards_in_play WHERE game_id = $1 AND player_id = $2`;
      database.any(getPlayerCardsByPlayerIDQuery, [userPackage.gameID, userPackage.playerID])
        .then(function(data){
          for (var index = 0; index < data.length; index++){
            var card = new Object();
            card.card_id = data[index].card_id;
            card.card_name = data[index].card_name;
            console.log("card = ", card.card_name);
            card.value = data[index].value;
            hand[index] = card;
          }
          userPackage.hand = hand;
          console.log("hand length = ", hand.length);
          var cardString = 'cards = '; //this is for testing purposes only
          for (var index = 0; index < hand.length; index++){
            cardString += hand[index].card_name.toString();
            cardString += ' ';
            console.log("card string = ", cardString);
          }
          io.sockets.in(userPackage.playerChannel).emit('SEND_CARDS', cardString);
        })
        .catch(function(error) {
          console.log("ERROR:",error);
        });
    }

    function goFish(userPackage){

    }


    })
}

module.exports = { init }
