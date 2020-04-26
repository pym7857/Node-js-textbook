var express = require('express');
var User = require('../schemas/user');

var router = express.Router();

/*  GET /users    */
router.get('/', function(req, res, next) {
  User.find({})
  .then((users) => {
    res.json(users);  // GET /에서도 사용자 데이터를 조회했지만, GET /users에서는 데이터를 JSON 형식으로 변환 
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});

/*  POST /users   */
router.post('/', function(req, res, next) {
  const user = new User({
    name: req.body.name,
    age: req.body.age,
    married: req.body.married,
  });
  user.save()
  .then((result) => {
    console.log(result);
    res.status(201).json(result);
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});

module.exports = router;
