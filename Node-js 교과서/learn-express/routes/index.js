var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });  // res.render(템플릿, 변수 객체)
});

module.exports = router;
