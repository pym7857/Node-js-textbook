var express = require('express');
var User = require('../models').User;

var router = express.Router();

// 사용자 조회  (GET /)
router.get('/', function(req, res, next) {
  User.findAll()      // 조회 
  .then((users) => {
    res.json(users);  // 데이터를 JSON 형식으로 변환
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});

// 사용자 등록 요청을 처리  (POST /)
router.post('/', function(req, res, next) {
  User.create({       // INSERT INTO
    name: req.body.name,
    age: req.body.age,
    married: req.body.married,
  })
  .then((result) => {
    console.log('유저 등록 완료: ', result);
    res.status(201).json(result);
  })
  .catch((err) => {
    console.error(err);
    next(err);
  });
});

module.exports = router;
