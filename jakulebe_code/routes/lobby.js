var express = require('express');
var router = express.Router();
var {database} = require('../database/database');
const {User} = require('../database/');

function loggedIn(req, res, next) {
    if (req.user) {
        next();
        console.log(req.user, "logged in");
    } else {
        console.log("not logged in");
        res.render('login', {message:'you must be logged in to view lobby'});
    }
}

function getUserInfo(req, res, next){
  var userQuery = `select * from registeredUsers where username = $1`;
  database.oneOrNone(userQuery, [req.session.passport.user])
  .then(function(data){
    if (data == null || data.length == 0){
      return res.redirect('/');
    }
    else {
      console.log("creating user object");
      var user = new Object();
      user.playerID = data.player_id;
      user.username = data.username;
      user.wins = data.wins;
      user.losses = data.losses;
      user.ties = data.ties;
      res.locals.user = user;
      next();
    }
  })
  .catch(function(error){
    console.log("ERROR: ", error);
    return res.send(error);
  });
}

router.use(loggedIn);
router.use(getUserInfo);

router.post('/logOut',function(req,res){
  req.logOut();
  res.redirect('/');
});

function getListOfGamesToJoin(req, res, next){
  const gameListQuery = `select * from Games WHERE game_id IN (SELECT game_id FROM Players WHERE player_id != $1)`;
  const gamesToJoin = [];
  var gameIndex = 0;

  database.any(gameListQuery, [res.locals.user.playerID])
    .then(function(data){
      if (data != null && data.length > 0)
      {
        for (var index = 0; index < data.length; index++)
        {
          if (data[index].current_players != data[index].max_players)
          {
            var gameRoom = new Object();
            gameRoom.gameID = data[index].game_id;
            gameRoom.gameRoomName = data[index].game_room_name;
            gameRoom.current_players = data[index].current_players;
            gameRoom.max_players = data[index].max_players;
            gamesToJoin[gameIndex] = gameRoom;
            gameIndex++;
          }
        }
      }
      res.locals.gamesToJoin = gamesToJoin;
      next();
    })
    .catch(function(error) {
             console.log("ERROR:",error);
             return res.send(error);
})
}

function getListOfGamesCurrentlyIn(req, res, next){
  const gameListQuery = `select * from Games WHERE game_id IN (SELECT game_id FROM Players WHERE player_id = $1)`;
  const gamesCurrentlyIn = [];
  var gameIndex = 0;

  database.any(gameListQuery, [res.locals.user.playerID])
    .then(function(data){
      if (data != null && data.length > 0)
      {
        for (var index = 0; index < data.length; index++)
        {
          if (data[index].current_players != data[index].max_players)
          {
            var gameRoom = new Object();
            gameRoom.gameID = data[index].game_id;
            gameRoom.gameRoomName = data[index].game_room_name;
            gameRoom.current_players = data[index].current_players;
            gameRoom.max_players = data[index].max_players;
            gamesCurrentlyIn[gameIndex] = gameRoom;
            gameIndex++;
          }
        }
      }
      res.locals.gamesCurrentlyIn = gamesCurrentlyIn;
      next();
    })
    .catch(function(error) {
             console.log("ERROR:",error);
             return res.send(error);
})
}

router.use(getListOfGamesToJoin);
router.use(getListOfGamesCurrentlyIn);

//gets the player number based on how many players are in game attempting to join
router.get('/joinGame', function getPlayerNumber(req, res, next){
  const gameID = parseInt(req.query.gameID);
  res.locals.gameID = gameID;


  const findPlayerNumberQuery = `select games.current_players as curr_players from games where games.game_id = $1`;
  database.oneOrNone(findPlayerNumberQuery, [gameID])
    .then(function(data){
      const current_players = parseInt(data.curr_players);
      if(current_players < 4)
      {
        res.locals.player_number = current_players+1;
        next();
      }
      else res.redirect('/lobby')
    })
    .catch(function(error){
      console.log("Error: ", error);
      return res.send(error);
    });

});

router.get('/joinGame', function(req, res, next){
  const gameID = parseInt(res.locals.gameID);
  const playerID = res.locals.user.playerID;

  const addPlayerToGameQuery = `INSERT INTO Players(game_id, player_id, player_number) VALUES($1, $2, $3)`;

  database.none(addPlayerToGameQuery, [gameID, playerID, res.locals.player_number])
  .then(function(){
    const updateCurrentPlayersQuery = `UPDATE Games SET current_players = current_players + 1 WHERE game_id = $1`;
    database.none(updateCurrentPlayersQuery, [gameID]);
  })
    .catch(function(error){
  });

    res.redirect(`/game?gameID=${gameID}`);
});

function checkIfGameNameTaken(req, res, next){
  const gameRoomName = req.body.gameRoomName;

  var gameNameQuery = `select * from Games where game_room_name = $1`;
  database.oneOrNone(gameNameQuery, [gameRoomName])
  .then(function(data){
    if(data != null)
    {
      res.render('lobby', { username:req.session.passport.user,
                            message:'logged in',
                            wins:res.locals.user.wins,
                            losses:res.locals.user.losses,
                            ties: res.locals.user.ties,
                            gameMessage: 'Game Name Taken!'
                          });
    }
    else {
      next();
    }
  })
  .catch(function(error){
    return res.send(error);
  });
}

function loadCardsFromDeck(req, res, next){
  var deck = [];
  const getCardsFromDeckQuery = `SELECT * FROM deck`;

  database.any(getCardsFromDeckQuery)
    .then(function(data){
      if (data != null && data.length > 0)
      {
        for (var index = 0; index < data.length; index++)
        {
          var card = new Object();
          card.card_id = data[index].card_id;
          //console.log("card id = ", card.card_id);
          card.card_name = data[index].card_name;
          card.value = data[index].value;
          deck[index] = card;
        }
      }
      res.locals.deck = deck;
      console.log("cards loaded into array");
      next();
    })
    .catch(function(error){
      console.log("Error: ", error);
      return res.send(error);
    });
  }

function shuffle(array){
    console.log("shuffling algorithm");
      for (let i = array.length; i; i--) {

            let j = Math.floor(Math.random() * i);
            [array[i - 1], array[j]] = [array[j], array[i - 1]];
        }
        console.log("shuffling algorithm finished");
  }

function shuffleCards(req, res, next){
    var deck = [];
    deck = res.locals.deck;
    shuffle(deck);
    res.locals.deck = deck;
    next();
}

function insertCardsIntoCardsInPlay(req, res, next){
    var deck = [];
    deck = res.locals.deck;
    const gameID = res.locals.gameID;
    const player_id = -1;

    for (let i = 0; i < deck.length; i++)
    {
      var card_id = deck[i].card_id;
      var card_name = deck[i].card_name;
      var value = deck[i].value;

      var insertCardQuery = `INSERT INTO cards_in_play(card_id, card_name, value, game_id, player_id) VALUES($1, $2, $3, $4, $5)`;
      database.none(insertCardQuery, [card_id, card_name, value, gameID, player_id])
        .then(function(){
          //console.log("card inserted: ", card_name);
          //next();
        })
        .catch(function(error){
          console.log("Error: ", error);
          return res.send(error);
        });
      }
      console.log("all cards inserted!");
      next();
}

router.use('/createGameRoom', checkIfGameNameTaken);

router.use('/createGameRoom',function (req,res,next){
  const gameRoomName = req.body.gameRoomName;
  const numberOfPlayers = 4;
  const current_players = 0;

  const createGameQuery = `INSERT INTO Games(game_room_name, max_players, current_players) VALUES ($1, $2, $3) RETURNING game_id`;
  database.oneOrNone(createGameQuery,[gameRoomName,numberOfPlayers,current_players])
    .then(function(data){
      res.locals.gameID = parseInt(data.game_id);

      next();
      //res.redirect(`/lobby/joinGame?gameID=${gameID}`);
    })
    .catch(function(error) {
      console.log("ERROR:",error);
      return res.send(error);
    });
});

router.use('/createGameRoom', loadCardsFromDeck);
router.use('/createGameRoom', shuffleCards);
router.use('/createGameRoom', insertCardsIntoCardsInPlay);

router.post('/createGameRoom', function(req, res, next){
  const gameID = res.locals.gameID;
  res.redirect(`/lobby/joinGame?gameID=${gameID}`);
})

router.get('/', function(req, res, next) {



  User.wins_desc()
    .then( users => {
      leaderboard = {
        heading: 'Leaderboards',
        users
      };
      res.render('lobby', {
        username:req.session.passport.user,
        message:'logged in', wins:res.locals.user.wins,
        losses:res.locals.user.losses,
        ties: res.locals.user.ties,
        leaderboard
      });
    })

});


module.exports = router;
