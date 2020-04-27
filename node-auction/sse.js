const SSE = require('sse');

module.exports = (server) => {
    const sse = new SSE(server);        // 서버 객체를 생성 
    sse.on('connection', (client) => {  // connection이벤트 리스너: 클라이언트와 연결 시
        setInterval(() => {
            client.send(new Date().valueOf().toString());
        }, 1000);   // 1초마다, 접속한 클라이언트에게 서버 시간 타임스탬프를 보냄(단, 문자열 형태로만 보낼 수 있음)
    });
};