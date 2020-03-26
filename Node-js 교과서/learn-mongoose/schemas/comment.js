const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const commentSchema = new Schema({
    commenter: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 몽구스의 model 메서드로, 스키마(commentSchema)와 몽고디비 컬렉션을 연결하는 모델을 생성 
module.exports = mongoose.model('Comment', commentSchema);

/* 몽구스는 model 메서드의 첫번째 인자로 컬렉션 이름을 만듭니다.
첫번째 인자가 Comment라면 첫글자를 소문자로 만든 뒤 복수형으로 바꿔서,
comments 컬렉션이 됩니다. (강제 개명) */