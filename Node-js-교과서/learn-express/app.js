var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');   // express-session : 따로 설치
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use : 미들웨어를 연결 

app.use(function(req, res, next) {
  console.log(req.url,'저도 미들웨어입니다.');
  next();
});

// dev 모드로 log확인 ( morgan : 요청을 기록 )
app.use(logger('dev'));   
// static 미들웨어는 정적인 파일들을 제공한다
app.use(express.static(path.join(__dirname, 'public')));
// 익스프레스 4.16.0 버전부터 body-parser의 일부 기능이 익스프레스에 내장됨.
// body-parser를 사용하면, req.on('data'), req.on('end') 필요 X   -> req.body에 바로 들어감
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
// cookieParser : 요청에 동봉된 쿠키를 해석해줌 
app.use(cookieParser('secret code'));
// express-session: 세션 관리용 미들웨어 
app.use(session({
  resave: false,  // 요청이 왔을 때 세션에 수정사항이 생기지 않더라도 세션을 다시 저장할지
  saveUninitialized: false,   // 세션에 저장할 내역이 없더라도 세션을 저장할지 (방문자 추적)
  secret:'secret code',   // cookieParser의 비밀키 역할 (클라이언트에 쿠키를 보낼때(=세션 쿠키), 안전하게 전송하기 위해 쿠키에 서명 추가)
  cookie: {   // 세션 쿠키에 대한 설정 
    httpOnly: true,   // 클라이언트에서 쿠키를 확인하지 못하도록 
    secure: false,    // https가 아닌 환경에서도 사용할 수 있도록 (배포 시에는 https를 적용!)
  }
}));
// connect-flash (일회용 메시지)
app.use(flash());

// app.use를 사용하므로, Router도 일종의 미들웨어 
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 처리 미들웨어
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들러 (배포 환경에서는 보안상 error 부분이 렌더링 되지 않는다.)
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
