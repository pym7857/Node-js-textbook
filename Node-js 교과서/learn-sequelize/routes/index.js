var express = require('express');
var User = require('../models').User;

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  User.findAll()
  .then((users) => {
    res.render('sequelize', { users });   // sequelize.pug에 렌더링할 때 결과값인 users를 넣어줍니다.
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});

module.exports = router;



/* async/await 문법으로 표현해보면... */
/*
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.render('sequelize', { users });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
*/


