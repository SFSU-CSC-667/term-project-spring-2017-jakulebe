var express = require('express');
var router = express.Router();
var {database} = require('../database/database');


//this is barebones right now, mainly pulling the name of the game from db to display
router.use(function getGameInfo(req, res, next){
  const gameID = parseInt(req.query.gameID);
  console.log("calling game functions");
  res.locals.gameID = gameID;
  console.log("gameID = ", gameID);
  const getGameInfoQuery = `select * from Games where game_id = $1`;
  database.oneOrNone(getGameInfoQuery, [gameID])
    .then(function(data){
      console.log("running query");
      res.locals.gameRoomName = data.game_room_name;
      res.locals.gameID = data.game_id;
      res.locals.max_players = data.max_players;
      res.locals.current_players = data.current_players;
      next();
    })
    .catch(function(error) {
      console.log("ERROR:",error);
      return res.send(error);
      });
});




function getPlayersInfo(req, res, next){
  const gameID = parseInt(req.query.gameID);
  const getPlayersInGameQuery = `SELECT * FROM registeredUsers WHERE player_id IN (Select player_id FROM Players WHERE game_id = $1)`;
  const playersInGame = [];

  database.any(getPlayersInGameQuery, [gameID])
    .then(function(data){
      if (data != null && data.length > 0)
      {
        for (var index = 0; index < data.length; index++)
        {
            playersInGame[index] = data[index].username;
        }
      }
      res.locals.playersInGame = playersInGame;
      next();
    })
    .catch(function(error) {
      console.log("ERROR:",error);
      return res.send(error);
    });
}

router.use(getPlayersInfo);


//router.use(getPlayerNumberForEachPlayer);

function checkIfGameFull(req, res, next){
  const gameID = res.locals.gameID;
  console.log("check if game full function, gameid = ", gameID);

  const gameQuery = `SELECT * FROM Games WHERE game_id = $1`;

  database.oneOrNone(gameQuery, [gameID])
    .then(function(data){
      if (data.max_players == data.current_players){
        res.locals.gameFullFlag = 1;
        console.log("game full!");
        next();
      }
      else {
        console.log("game is not full!");
        res.locals.gameFullFlag = 0;
        next();
      }
    })
    .catch(function(error) {
      console.log("ERROR:",error);
      return res.send(error);
    });

    //next();
}




router.use(checkIfGameFull);

function getPlayerIDNumbers(req, res, next){
  if (res.locals.gameFullFlag){
    console.log("fetching player_id numbers");
    var playerIDNumbers = [];
    const query = `SELECT * FROM players WHERE game_id = $1 ORDER BY player_number ASC`;
    database.any(query, [res.locals.gameID])
      .then(function(data){
        for (var index = 0; index < data.length; index++)
        {
          playerIDNumbers[index+1] = data[index].player_id;
          console.log(playerIDNumbers[index+1], index+1);
          //next();
        }
        res.locals.playerIDNumbers = playerIDNumbers;
        res.locals.readyToDealFlag = 1;
        console.log('ready to deal flag = ', res.locals.readyToDealFlag);
        next();
      })
      .catch(function(error) {
        console.log("ERROR:",error);
        return res.send(error);
      });
      //console.log('player 1 = ', playerIDNumbers[1]);
      //console.log('player 2 = ', playerIDNumbers[2]);

  //next();
} else  {
  res.locals.readyToDealFlag = 0;
  next();
  }

  //next();
}

router.use(getPlayerIDNumbers);

function dealCards(req, res, next){
  if(res.locals.readyToDealFlag){
    const maxPlayers = res.locals.max_players;
    const gameID = res.locals.gameID;
    var playerIDNumbers = [];
    playerIDNumbers = res.locals.playerIDNumbers;
    console.log('ready to deal');
    console.log('max players = ', maxPlayers);
    console.log('gameID = ', gameID);
    

    const dealCardQuery = `UPDATE cards_in_play SET player_id = $1 WHERE card_id IN
                            (SELECT card_id FROM cards_in_play WHERE game_id = $2
                              AND player_id = -1 LIMIT 7)`;
    if (maxPlayers == 2){
      database.tx(t => {
        return t.batch([
            t.none(dealCardQuery, [playerIDNumbers[1], gameID]),
            t.none(dealCardQuery, [playerIDNumbers[2], gameID])
        ]);
      })
    }

    if (maxPlayers == 3){
      database.tx(t => {
        return t.batch([
            t.none(dealCardQuery, [playerIDNumbers[1], gameID]),
            t.none(dealCardQuery, [playerIDNumbers[2], gameID]),
            t.none(dealCardQuery, [playerIDNumbers[3], gameID])
        ]);
      })
    }

    if (maxPlayers == 4){
      database.tx(t => {
        return t.batch([
            t.none(dealCardQuery, [playerIDNumbers[1], gameID]),
            t.none(dealCardQuery, [playerIDNumbers[2], gameID]),
            t.none(dealCardQuery, [playerIDNumbers[3], gameID]),
            t.none(dealCardQuery, [playerIDNumbers[4], gameID])
        ]);
      })
    }

    next();
  } else {
    console.log("not ready to deal");
    next();
  }
  //next();
}

router.use(dealCards);

router.get('/', function(req, res, next) {
  //console.log('Game Full Flag = ', res.locals.gameFullFlag);
  res.render('gameroom', {username:req.session.passport.user,
                          gameRoomName: res.locals.gameRoomName,
                          players: res.locals.playersInGame});
});

module.exports = router;
