var express = require('express');
var User = require('../schemas/user');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  User.find({})   // 모든 사용자를 찾은 뒤,
  .then((users) => {
    res.render('mongoose', { users });  // mongoose.pug를 렌더링할 때 users 변수로 넣어줍니다.
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});

module.exports = router;

/*
  async/await 문법으로 표현하면 다음과 같습니다..
  
  router.get('/', async(req, res, next) => {
    try {
      const users = await User.find();
      res.render('mongoose', { users });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
 */
