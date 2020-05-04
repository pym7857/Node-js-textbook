/* 소켓 : 경매 화면에서 실시간으로 입찰 정보를 올리기 위해 사용합니다. */
const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = SocketIO(server, { paht: '/socket.io' });

    app.set('io', io);  // 라우터에서 io 객체를 쓸 수 있게 저장해둡니다.

    io.on('connection', (socket) => {
        /* 연결 시 주소로부터 경매방 아이디(roomId)를 받아와, socket.join()으로 해당 방에 입장 */
        const req = socket.request;
        const { headers: { referer } } = req;
        const roomId = referer.split('/')[referer.split('/').length -1];
        socket.join(roomId); 
        socket.on('disconnect', () => {
            socket.leave(roomId);   // socket.leave()로 해당 방에서 퇴장 
        });
    });
}



