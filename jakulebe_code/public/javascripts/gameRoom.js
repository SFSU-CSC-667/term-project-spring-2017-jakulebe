const gameID = document.currentScript.getAttribute('gameID');
const playerID = document.currentScript.getAttribute('playerID');
const username = document.currentScript.getAttribute('username');


const playerChannel = gameID.toString() + username;

const userPackage = new Object();
  userPackage.gameID = gameID;
  userPackage.playerID = playerID;
  userPackage.username = username;
  userPackage.playerChannel = playerChannel;


var socket = io();

socket.emit('JOIN_GAME', userPackage);


socket.on('TEST', function(userPackage){
  $( '.message' ).text(`${userPackage.username} connected`)
})

socket.on('PLAYER_TEST', function(userPackage){
  $( '.playerMessage').text(`this message is for ${userPackage.username} only`);
})
