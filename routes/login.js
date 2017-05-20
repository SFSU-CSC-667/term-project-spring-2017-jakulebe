var express = require('express');
var router = express.Router();
var {
    database
} = require('../database/database');
var passport = require('passport');

router.get('/', function(req, res) {
    res.render('login');
});

router.get('/loginError', function(req, res) {
    res.render('login', {
        error: true
    });
});

router.post('/loginUser', passport.authenticate('local', {
    successRedirect: '/lobby',
    failureRedirect: '/login/loginError'
}));

module.exports = router;
