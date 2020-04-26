const mongoose = require('mongoose');

module.exports = () => {
    const connect = () => {
        // 개발환경이 아닐때 몽구스가 생성하는 쿼리 내용을 콘솔을 통해 확인할 수 있는 부분
        if (process.env.NODE_ENV == 'production') {
            mongoose.set('debug', false);
        } else {
            mongoose.set('debug', true);
        }
        // 몽구스와 몽고디비를 연결 
        mongoose.connect('mongodb://root:1562@localhost:27017/admin', { // 몽고디비 주소로 접속을 시도 (admin)
            dbName:'nodejs',    // 실제 사용할 데이터베이스 이름 
        }, (error) => {
            if (error) {
                console.log('몽고디비 연결 에러', error);
            } else {
                console.log('몽고디비 연결 성공');
            }
        });
    };
    connect();

    mongoose.connection.on('error', (error) => {
        console.error('몽고디비 연결 에러', error);
    });
    mongoose.connection.on('disconnected', () => {
        console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
        connect();
    });
    // User스키마와 Comment스키마를 연결 
    require('./user');
    require('./comment');
};