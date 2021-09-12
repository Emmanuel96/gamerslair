var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', authController.getRegister )

router.post('/register', authController.postRegister )

router.get('/login', authController.getLogin)

router.post('/login', authController.postLogin)

router.get('/forgot-password', authController.getForgotPassword)

router.post('/forgot-password', authController.postForgotPassword)

router.get('/reset-password', authController.getResetPassword)

router.post('/reset-password', authController.postResetPassword)

module.exports = router;
