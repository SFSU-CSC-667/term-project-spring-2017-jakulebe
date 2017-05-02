var express = require('express');
var router = express.Router();
var {database} = require('../database/database');

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
    if (data== null || data.length == 0){
      return res.redirect('/');
    }
    else {
      console.log("creating user object");
      var user = new Object();
      user.playerID = data.playerid;
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

function getListOfGames(req, res, next){
  const gameListQuery = `select * from Games`;
  const games = [];
  var gameIndex = 0;

  database.any(gameListQuery)
    .then(function(data){
      if (data != null && data.length > 0)
      {
        for (var index = 0; index < data.length; index++)
        {
          if (data[index].current_players != data[index].max_players)
          {
            var gameRoom = new Object();
            gameRoom.gameID = data[index].gameid;
            console.log(data[index].gameid);
            gameRoom.gameRoomName = data[index].gameroomname;
            gameRoom.current_players = data[index].current_players;
            gameRoom.max_players = data[index].max_players;
            games[gameIndex] = gameRoom;
            gameIndex++;
          }
        }
      }
      res.locals.games = games;
      next();
    })
    .catch(function(error) {
             console.log("ERROR:",error);
             return res.send(error);
})
}

router.use(getListOfGames);

//gets the player number based on how many players are in game attempting to join
router.get('/joinGame', function getPlayerNumber(req, res, next){
  const gameID = parseInt(req.query.gameID);
  res.locals.gameID = gameID;


  const findPlayerNumberQuery = `select games.current_players as curr_players from games where games.gameid = $1`;
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
  console.log("gameID = ", gameID);
  const addPlayerToGameQuery = `INSERT INTO Players(gameID, playerID, player_number) VALUES($1, $2, $3)`;

  database.none(addPlayerToGameQuery, [gameID, playerID, res.locals.player_number])
    .then(function(){
      res.redirect(`/game?gameID=${gameID}`);
    })
    .catch(function(error){
      console.log("Error: ", error);
      return res.send(error);
    });

  const updateCurrentPlayersQuery = `UPDATE Games SET current_players = current_players + 1 WHERE gameid = $1`;
  database.none(updateCurrentPlayersQuery, [gameID]);
});

router.use('/createGameRoom',function (req,res,next){
  const gameRoomName = req.body.gameRoomName;
  const numberOfPlayers = 4;
  const current_players = 1;
  const createGameQuery = `INSERT INTO Games(gameRoomName, max_players, current_players) VALUES ($1, $2, $3) RETURNING gameID`;
  database.oneOrNone(createGameQuery,[gameRoomName,numberOfPlayers,current_players])
    .then(function(){
      next();
    })
    .catch(function(error) {
      console.log("ERROR:",error);
      return res.send(error);
    });
  res.redirect('/lobby')
});


router.get('/', function(req, res, next) {
  res.render('lobby', { username:req.session.passport.user, message:'logged in', wins:res.locals.user.wins, losses:res.locals.user.losses, ties: res.locals.user.ties });
});




module.exports = router;
