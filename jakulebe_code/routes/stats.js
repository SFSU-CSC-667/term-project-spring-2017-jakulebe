const express = require('express');
const router = express.Router();
const {User} = require('../database/');

router.get('/', (req, res) => {
  if(req.user) {
    User.wins_desc()
      .then( users => {
        leaderboard = {
          title: 'Stats',
          heading: 'Leaderboards',
          users
        };
        res.render('stats', leaderboard)
      })
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
