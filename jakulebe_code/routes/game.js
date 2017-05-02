var express = require('express');
var router = express.Router();
var {database} = require('../database/database');



//this is barebones right now, mainly pulling the name of the game from db to display
router.use(function getGameInfo(req, res, next){
  const gameID = parseInt(req.query.gameID);
  console.log("calling game functions");
  res.locals.gameID = gameID;
  console.log("gameID = ", gameID);
  const getGameInfoQuery = `select * from Games where gameid = $1`;
  database.oneOrNone(getGameInfoQuery, [gameID])
    .then(function(data){
      console.log("running query");
      res.locals.gameRoomName = data.gameroomname;
      next();
    })
    .catch(function(error) {
      console.log("ERROR:",error);
      return res.send(error);
      });
});

router.get('/', function(req, res, next) {
  res.render('gameroom', {username:req.session.passport.user, gameRoomName: res.locals.gameRoomName});
});


module.exports = router;
