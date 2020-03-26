const http = require('http');
const fs = require('fs');

const users = {};

http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            return fs.readFile('./restFront.html', (err, data) => {
                if (err) {
                    throw err;
                }
                res.end(data);
            });
        } else if (req.url === '/about') {
            return fs.readFile('./about.html', (err, data) => {
                if (err) {
                    throw err;
                }
                res.end(data);
            });
        } else if (req.url === '/users') {
            return res.end(JSON.stringify(users));
        }
        return fs.readFile(`.${req.url}`, (err, data) => {      // .은 현재위치 
            if (err) {
                res.writeHead(404, 'NOT FOUND');
                return res.end('NOT FOUND');
            }
            return res.end(data);
        });
    } else if (req.method === 'POST') {
        if (req.url === '/users') {
            let body = "";
            // req 이벤트가 감지되면, 데이터를 body에 받아온다
            req.on('data', (data) => {
                body += data;
            });
            // end 이벤트가 감지되면, 데이터 수신을 종료하고 내용을 출력한다
            return req.on('end', () => {    
                console.log('POST 본문{Body}:', body);
                const { name } = JSON.parse(body);      // JSON.parse : JSON 형식의 문자열을 자바스크립트 객체로 변환함.
                const id = +new Date();
                users[id] = name;
                console.log('users[id] -> ', users[id]);
                res.writeHead(201);
                res.end('등록 성공!');
            });
        }
    } else if (req.method === 'PUT') {
        if (req.url.startsWith('/users/')) {
            const key = req.url.split('/')[2];
            let body ="";
            req.on('data', (data) => {
                body += data;
            });
            return req.on('end', () => {
                console.log('PUT 본문{Body}:', body);
                users[key] = JSON.parse(body).name;
                return res.end(JSON.stringify(users));
            });
        }
    } else if (req.method === 'DELETE') {
        if (req.url.startsWith('/users/')) {
            const key = req.url.split('/')[2];
            delete users[key];
            return res.end(JSON.stringify(users));
        }
    }
    res.writeHead(404, 'NOT FOUND');
    return res.end('NOT FOUND');
})
    .listen(8085, () => {   // localhost:8085
        console.log('8085번 포트에서 서버 대기 중입니다.');
    });