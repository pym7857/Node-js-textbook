const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');  // 스케쥴링 (시간 예약)

const { Good, Auction, User, sequelize } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;     // 모든 pug 템플릿에 사용자 정보를 변수로 집어 넣었습니다.
                                    // 이렇게 하면 res.render 메서드에 user: req.user를 하지 않아도 되므로 중복을 제거할 수 있습니다.
    next();
});

/* 메인 화면 렌더링 [ GET / ] */
router.get('/', async (req, res, next) => {
    try {
        /* 렌더링 할때 경매가 진행 중인 상품 목록도 같이 불러옵니다. */
        const goods = await Good.findAll({ where: { soldId: null } });  // soldId : 낙찰자의 아아디이므로, 낙찰자가 null이면 경매가 진행 중인 것입니다.
        res.render('main', {        // main.pug
            title:'NodeAuction',
            goods,
            loginError: req.flash('loginError'),
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/* 회원가입 화면 렌더링 [ GET /join ] */
router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title:'회원가입 - NodeAuction',
        joinError: req.flash('joinError'),
    });
});

/* 상품 등록 화면 렌더링 [ GET /good ] */
router.get('/good', isLoggedIn, (req, res) => {
    res.render('good', { title:'상품 등록 - NodeAuction' });    // good.pug
});

fs.readdir('uploads', (error) => {
    if (error) {
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync('uploads');
    }
});
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

/* 업로드한 상품을 처리하는 라우터 [ POST /good ] */
router.post('/good', isLoggedIn, upload.single('img'), async (req, res, next) => {
    try {
        const { name, price } = req.body;
        const good = await Good.create({
            ownerId: req.user.id,
            name,
            img: req.file.filename,
            price,
        });
        /** 
         * 스케쥴러(예약) 설정 
         * - 단, node-shcedule 패키지의 단점은 스케쥴링이 노드 기반으로 작동되므로 노드가 종료되면 스케쥴 예약도 같이 종료된다. 
         * - 위와 같은 단점을 보완하기 위해 checkAuction.js를 작성 */ 
        const end = new Date();
        end.setDate(end.getDate() + 1);             // 하루 뒤 
        schedule.scheduleJob(end, async () => {     // schedule객체의 scheduleJob메서드로 일정을 예약할 수 있습니다. (첫번째 인자: 실행될 시각,  두번째 인자: 해당 시각이 되었을 때 수행할 콜백 함수)
            const success = await Auction.findOne({
                where : { goodId: good.id },
                order: [['bid','DESC']],            // 최고가격 입찰자 순으로 정렬 
            });
            await Good.update({ soldId: success.userId }, { where: { id: good.id } });
            await User.update({
                money: sequelize.literal(`money - ${success.bid}`),     // 해당 컬럼(money)의 숫자를 줄이는 방법 
            }, {
                where: { id: success.userId },
            });
        });
        res.redirect('/');
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/*  해당 상품과 기존 입찰 정보들을 불러온 뒤 렌더링 [ GET /good/:id ] */
router.get('/good/:id', isLoggedIn, async (req, res, next) => {
    try {
        const [good, auction] = await Promise.all([     // Promise.all : 여러 프로미스가 모두 완료될 때 실행..
            Good.findOne({
                where: { id: req.params.id },
                include: {                              // db.Good.belongsTo(db.User, { as: 'owner' });  (hasMany나 belongsTo로 연결해두어야 include옵션 사용가능)
                    model: User,
                    as:'owner',                         // Good모델과 User모델은 현재 일대다 관계가 두번 연결(owner,sold)되어 있으므로, 이런 경우에는 어떤 관계를 include할지 as속성으로 밝혀주어야 합니다.
                },
            }),
            Auction.findAll({
                where: { goodId: req.params.id },
                include: { model: User },
                order: [['bid','ASC']],
            }),
        ]);
        res.render('auction', {
            title: `${good.name} - NodeAuction`,
            good,
            auction,
            auctionError: req.flash('auctionError'),
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/* 클라이언트로부터 받은 입찰 정보를 저장 [ POST /good/:id/bid ] */
router.post('/good/:id/bid', isLoggedIn, async (req, res, next) => {
    try {
        const { bid, msg } = req.body;
        const good = await Good.findOne({   
            where: { id: req.params.id },
            include: { model: Auction },                    // db.Good.hasMany(db.Auction);  (hasMany나 belongsTo로 연결해두어야 include옵션 사용가능)
            order: [[{ model: Auction },'bid','DESC']],     // include될 모델의 컬럼을 정렬하는 방법
        });

        // 시작 가격보다 낮게 입찰하면 
        if (good.price > bid) {     
            return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.');
        }
        // 경매 종료 시간이 지났으면
        if (new Date(good.createdAt).valueOf() + (24*60*60*1000) < new Date()) {
            return res.status(403).send('경매가 이미 종료되었습니다.');
        }
        // 직전 입찰가와 현재 입찰가 비교 
        if (good.auctions[0] && good.auctions[0].bid >= bid) {
            return res.status(403).send('이전 입찰가보다 높아야 합니다.');
        }
        // 정상적인 입찰가가 들어왔다면 저장 후, 
        const result = await Auction.create({
            bid,
            msg,
            userId: req.user.id,
            goodId: req.params.id,
        });
        // 해당 경매방의 모든 사람에게 입찰자, 입찰가격, 입찰 메시지 등을 웹 소켓으로 전달합니다.
        req.app.get('io').to(req.params.id).emit('bid', {
            bid: result.bid,
            msg: result.msg,
            nick: req.user.nick,
        });
        return res.send('ok');
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/* 낙찰자가 낙찰 내역을 볼 수 있도록 [ GET /list ] */
router.get('/list', isLoggedIn, async (req, res, next) => {
    try {
        const goods = await Good.findAll({
            where: { soldId: req.user.id },
            include: { model: Auction },
            order: [[{ model: Auction },'bid','DESC']],
        });
        res.render('list', { title:'낙찰 목록 - NodeAuction', goods});
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
