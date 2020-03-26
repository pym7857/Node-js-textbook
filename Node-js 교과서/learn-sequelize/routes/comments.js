var express = require('express');
var { User, Comment } = require('../models');

var router = express.Router();

// 댓글 가져오기 (GET /id)
router.get('/:id', function(req, res, next) {
    Comment.findAll({
        include: {      // hasMany나 belongsTo로 연결해두어야 include옵션 사용가능
            model: User,
            where: { id: req.params.id },
        },
    })
    .then((comments) => {
        console.log('이 유저의 댓글들: ', comments);
        res.json(comments);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

// 댓글 생성 라우터 (POST /)
router.post('/', function(req, res, next) {
    Comment.create({            // INSERT INTO
        commenter: req.body.id,     // commenter속성에 사용자 아이디를 넣어 사용자와 댓글을 연결해줍니다.
        comment: req.body.comment,
    })
    .then((result) => {
        console.log('댓글 등록 완료: ', result);
        res.status(201).json(result);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

// 댓글 수정(update)
router.patch('/:id', function(req, res, next) {
    Comment.update({ comment: req.body.comment }, { where: { id: req.params.id } })
    .then((result) => {
        console.log('댓글 수정 완료: ', result);
        res.json(result);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

// 댓글 삭제(destroy)
router.delete('/:id', function(req, res, next) {
    Comment.destroy({ where: { id: req.params.id } })
    .then((result) => {
        console.log('댓글 삭제 완료: ', result);
        res.json(result);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

module.exports = router;