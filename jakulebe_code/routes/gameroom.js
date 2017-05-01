var express = require('express');
var router = express.Router();
var {database} = require('../database/database');

router.get('/', function(req, res) {
  res.render('gameroom');
});

router.post('/createGameRoom', function(req, res, next)
{
  let gameRoomName = req.body.gameRoomName;
  const numberOfPlayers = 4;
  var insertQuery = `INSERT INTO Games (gameRoomName, max_players) VALUES ($1, $2)`;
  client.query(insertQuery, [gameRoomName, numberOfPlayers]);
});

module.exports = router;
