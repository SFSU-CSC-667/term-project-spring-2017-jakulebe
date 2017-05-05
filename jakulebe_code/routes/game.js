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
      res.locals.gameID = data.gameid;
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
  const getPlayersInGameQuery = `SELECT * FROM registeredUsers WHERE playerID IN (Select playerID FROM Players WHERE gameID = $1)`;
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

router.use(loadCardsFromDeck);

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

router.use(shuffleCards);

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
        next();
      })
      .catch(function(error){
        console.log("Error: ", error);
        return res.send(error);
      });
    }
    console.log("all cards inserted!");
    next();
}


router.use(insertCardsIntoCardsInPlay);





router.get('/', function(req, res, next) {
  res.render('gameroom', {username:req.session.passport.user, gameRoomName: res.locals.gameRoomName, players: res.locals.playersInGame});
});

module.exports = router;
