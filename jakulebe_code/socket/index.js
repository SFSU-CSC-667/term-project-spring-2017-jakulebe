const socketIo = require( 'socket.io' )
var {database} = require('../database/database');
const { USER_JOINED, MESSAGE_SEND } = require( '../src/constants/events' )

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



    function initializeGameSockets(userPackage){
        console.log("joining game: ", userPackage.gameID);
        console.log("player channel: ", userPackage.playerChannel);

        socket.join(userPackage.gameID);
        socket.join(userPackage.playerChannel);

        io.sockets.in(userPackage.gameID).emit('TEST', userPackage );
        io.sockets.in(userPackage.playerChannel).emit('PLAYER_TEST', userPackage);
        }

    })
}

module.exports = { init }
