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
      user.playerID = data.playerID;
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

router.use('/createGame',function (req,res,next){
  const gameRoomName = req.body.gameRoomName;
  console.log("gamename: " + gameRoomName);
  const numberOfPlayers = 4;
  const createGameQuery = `INSERT INTO Games(gameRoomName, max_players) VALUES ($1, $2) RETURNING gameID`;
  database.oneOrNone(createGameQuery,[gameRoomName,numberOfPlayers])
     .then(function()
     {
       next();
     })
     .catch(function(error) {
             console.log("ERROR:",error);
             return res.send(error);
     });
 });

router.use(loggedIn);
router.use(getUserInfo);

router.post('/logOut',function(req,res){
  req.logOut();
  res.redirect('/');
});

router.get('/', function(req, res, next) {
  res.render('lobby', { username:req.session.passport.user, message:'logged in', wins:res.locals.user.wins, losses:res.locals.user.losses, ties: res.locals.user.ties });
});




module.exports = router;
