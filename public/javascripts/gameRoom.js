const gameID = document.currentScript.getAttribute('gameID');
const playerID = document.currentScript.getAttribute('playerID');
const username = document.currentScript.getAttribute('username');
const playerNumber = document.currentScript.getAttribute('playerNumber');
const playerChannel = gameID.toString() + username;
const userPackage = new Object();

userPackage.gameID = gameID;
userPackage.playerID = playerID;
userPackage.username = username;
userPackage.playerChannel = playerChannel;
userPackage.playerNumber = playerNumber;
userPackage.currentPlayerTurn = 1;
userPackage.booksWon = 0;

var socket = io();

socket.emit('JOIN_GAME', userPackage);

socket.on('TEST', function(userPackage) {
    $('.message').text(`${userPackage.username} connected`)
})

socket.on('PLAYER_TEST', function(userPackage) {
    $('.playerMessage').text(`this message is for ${userPackage.username} only`);
})

socket.on('SEND_CARDS', function(hand) {
    $('.show-player > .col-sm-1 > img ').hide();
    $('.hand').empty();
    for (var i = 0; i < hand.length; i++) {
        $('.hand').prepend('<img id= "card' + hand[i].card_name + '"/>');
    }

    if (userPackage.currentPlayerTurn == userPackage.playerNumber) {
        //$('.message').hide()
        $('#player-turn-area').show();
    } else {
        $('.message').text(`it is player ${userPackage.currentPlayerTurn}'s turn`);
    }
})

socket.on('INCREMENT_CURRENT_PLAYER_TURN', function(dataPackage) {
    if (userPackage.currentPlayerTurn < 4) {
        userPackage.currentPlayerTurn++;
    } else {
        userPackage.currentPlayerTurn = 1;
    }
    socket.emit('GET_TURN_STATUS', 'wee');
})

socket.on('REFRESH_CURR_PLAYER_CARDS', function(userPackage) {
    socket.emit('REFRESH_HAND', userPackage);
})

socket.on('REFRESH_ALL_PLAYERS_HANDS', function(test) {
    socket.emit('REFRESH_HAND', userPackage);
})

socket.on('NEED_TO_GO_FISH', function(userPackage) {
    $('.status').text('GOING FISHING!!!!');
    socket.emit('GO_FISH', userPackage);
})

socket.on('GO_FISH_RESULT', function(userPackage) {
    $('#player-turn-area').hide()
    socket.emit('REFRESH_HAND', userPackage);
    $('.status').text('You received a card!');
})

socket.on('SEND_TURN_STATUS', function(userPackage) {
    if (userPackage.currentPlayerTurn == userPackage.playerNumber) {
        //$('.message').hide()
        $('#player-turn-area').show();
    } else {
        $('.message').text(`it is player ${userPackage.currentPlayerTurn}'s turn`);
    }
})

var animateCards = function(loggedInUserId, fromPlayerId, toPlayerId) {
    loggedInUserId = playerNumber;

    if (fromPlayerId < 1) {
        $('#deck_card').show();
        $('#deck_card').addClass("animate_deck_" + loggedInUserId + "_" + toPlayerId);
    } else {
        $('.p_' + loggedInUserId + '_' + fromPlayerId + ' .col-sm-1 .animate_' + loggedInUserId + '_' + fromPlayerId + '_' + toPlayerId).show();
    }

    setTimeout(function() {
        $('.p_' + loggedInUserId + '_' + fromPlayerId + ' .col-sm-1 .animate_' + loggedInUserId + '_' + fromPlayerId + '_' + toPlayerId).hide();
        $('#deck_card').hide();
        $('#deck_card').removeClass("animate_deck_" + loggedInUserId + "_" + toPlayerId);
    }, 2000);
};

$(document).ready(() => {
    $('#player-turn-area').hide()
    $('#startGame').hide()
    $('#deck_card').hide();
    $('.show-player .col-sm-1 img ').hide();

    socket.on('START_GAME_BUTTON', function(userPackage) {
        $('#startGame').show()
    })

    $('#startGame button').click(event => {
        socket.emit('START_GAME', userPackage);
    })

    $('#startGame button').click(event => {
        socket.emit('START_GAME', userPackage);
    })

    $('#requestCard').click(event => {
        console.log("in requestCard click event");
        var rCard = $('#playerRequestCard :selected').val();
        var rPlayer = $('#playerRequestOpponent :selected').val();
        animateCards(playerNumber, rPlayer, playerNumber);
        userPackage.rCard = rCard;
        userPackage.rPlayer = rPlayer;
        socket.emit('REQUEST_CARD', userPackage);

    })

    socket.on('STARTING_GAME', function(cardTestString) {
        $('#startGame').hide()
        $('.hand').text('game starting')
        socket.emit('GET_HAND', userPackage)
    })
})
