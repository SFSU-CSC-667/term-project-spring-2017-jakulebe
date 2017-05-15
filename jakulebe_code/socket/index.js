const socketIo = require( 'socket.io' )
var {database} = require('../database/database');
const { USER_JOINED, MESSAGE_SEND } = require( '../src/constants/events' )


const getPlayerCardsByPlayerIDQuery = `SELECT * FROM cards_in_play WHERE game_id = $1 AND player_id = $2`;

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

    socket.on('START_GAME', sendCardData)



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

    function sendCardData(userPackage){
      //io.sockets.in(userPackage.gameID).emit('START_GAME', userPackage);

      var playerHand = [];
      database.any(getPlayerCardsByPlayerIDQuery, [userPackage.gameID, userPackage.playerID])
        .then(function(data){
          for (var index = 0; index < data.length; index++){
            var card = new Object();
            card.card_id = data[index].card_id;
            card.card_name = data[index].card_name;
            console.log('card = ',card.card_name);
            card.value = data[index].value;
            playerHand[index] = card;
          }
          var cardTestString = 'cards = ';
          for (var i = 0; i < playerHand.length; i++){
            cardTestString += playerHand[i].card_name;
            cardTestString += ' ';
          }

          io.sockets.in(userPackage.playerChannel).emit('SEND_CARDS', cardTestString);
        })
        .catch(function(error) {
          console.log("ERROR:",error);

        });
    }


    })
}

module.exports = { init }
