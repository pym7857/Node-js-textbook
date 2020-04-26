/* 로그인을 위한 라우터들과 미들웨어를 추가 */
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

/* 회원가입 라우터 [ POST /auth/join ] */
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password, money } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            req.flash('joinError','이미 가입된 이메일입니다.');
            return res.redirect('/join');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
            money,
        });
        return res.redirect('/');
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            
        }
    })
})