var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jakulebe' });
});

router.post('/goToRegister', function(req, res, next){
  res.redirect('/register');
})

router.post('/goToLogin', function(req, res, next){
  res.redirect('/login');
})

router.post('/goToGameRoom', function(req, res, next){
  res.redirect('/gameroom');
})


module.exports = router;
