var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('gameroom');
});

router.post('/createGameRoom', function(req, res, next)
{
  let gameRoomName = req.body.gameRoomName;
  const numberOfPlayers = 4;
  var insertQuery = `INSERT INTO Games (gameRoomName, max_players) VALUES ($1, $2)`;
  database.none(insertQuery, [gameRoomName, numberOfPlayers])
  .then(function()
  {
    next();
  })
  .catch(function(error){
    return res.send(error);
  });
}, passport.authenticate('local',
{successRedirect: '/gameroom', failureRedirect: '/'}));

module.exports = router;
