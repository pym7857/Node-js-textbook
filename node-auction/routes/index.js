const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Good, Auction, User } = require('../models');
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
        await Good.create({
            ownerId: req.user.id,
            name,
            img: req.file.filename,
            price,
        });
        res.redirect('/');
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
