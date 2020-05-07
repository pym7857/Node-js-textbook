const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        res.send('ok');
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;