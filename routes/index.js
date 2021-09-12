var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', authController.getRegister )

router.post('/register', authController.postRegister )

module.exports = router;
