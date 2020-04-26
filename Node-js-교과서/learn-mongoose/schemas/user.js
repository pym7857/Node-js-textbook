const mongoose = require('mongoose');

const { Schema } = mongoose;    // 구조 분해 
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,   // 고유한 값 
    },
    age: {
        type: Number,
        required: true,
    },
    married: {
        type: Boolean,
        required: true,
    },
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 몽구스의 model 메서드로, 스키마(userSchema)와 몽고디비 컬렉션을 연결하는 모델을 생성 
module.exports = mongoose.model('User', userSchema);

/* 몽구스는 model 메서드의 첫번째 인자로 컬렉션 이름을 만듭니다.
첫번째 인자가 User라면 첫글자를 소문자로 만든 뒤 복수형으로 바꿔서,
users 컬렉션이 됩니다. (강제 개명) */