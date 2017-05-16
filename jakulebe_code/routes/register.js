var express = require('express');
var router = express.Router();
var {
    database
} = require('../database/database');
var passport = require('passport');

router.get('/', function(req, res, next) {
    res.render('register');
});

router.use('/registerUser', function checkIfUserNameTaken(req, res, next) {
    var username = req.body.username;
    var nameQuery = `select * from registeredUsers where username = $1`;
    database.oneOrNone(nameQuery, [username])
        .then(function(data) {
            if (data != null) {
                res.render('register', {
                    message: 'username taken'
                });
            } else {
                next();
            }
        })
        .catch(function(error) {
            return res.send(error);
        });
});

router.post('/registerUser', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var encryptedPassword = new Buffer(password).toString('base64');
    var insertQuery = `INSERT INTO registeredUsers (username, password) VALUES ($1, $2)`;
    database.none(insertQuery, [username, encryptedPassword])
        .then(function() {
            next();
        })
        .catch(function(error) {
            return res.send(error);
        });
}, passport.authenticate('local', {
    successRedirect: '/lobby',
    failureRedirect: '/login/loginError'
}));

module.exports = router;
