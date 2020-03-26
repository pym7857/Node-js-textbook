var express = require('express');
var Comment = require('../schemas/comment');

var router = express.Router();

/*  GET /comments    */
/**
 * populate 메서드로 관련있는 컬렉션의 다큐먼트를 불러올 수 있다.
 * Comment스키마(schemas/comment.js)의 commenter 필드의 ref가 User로 되어 있으므로,
 * 알아서 users 컬렉션에서 사용자 다큐먼트를 찾아 합칩니다.  
 * 이제 commenter필드는, ObjectID(=5a1678473463af03...)가 아니라 그 ObjectId를 가진 사용자(User) 다큐먼트가 된다. (=join)
 */
router.get('/:id', function(req, res, next) {
    Comment.find({ commenter: req.params.id }).populate('commenter')
    .then((comments) => {
        console.log(comments);
        res.json(comments);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

/*  댓글 등록 : POST /comments    */
router.post('/', function(req, res, next) {
    const comment = new Comment({   // Comment스키마로 comment 객체 생성 
        commenter: req.body.id,
        comment: req.body.comment,
    });
    comment.save()  // 다큐먼트에 내용을 넣은 후에 저장
    .then((result) => {
        return Comment.populate(result, {path:'commenter'});    // result를 populate메서드로 User스키마와 합쳤습니다. (=join)
                                                                // path 옵션으로 어떤 필드를 합칠지 설정
    })
    .then((result) => {
        res.status(201).json(result);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

/*  PATCH /comments/:id    */
router.patch('/:id', function(req, res, next) {
    Comment.update({_id: req.params.id}, {comment: req.body.comment})   // 시퀄라이즈 와는 반대로 ({수정할 다큐먼트}, {수정할 내용})
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

/*  DELETE /comments/:id    */
router.delete('/:id', function(req, res, next) {
    Comment.remove({_id: req.params.id})
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

module.exports = router;