const express = require('express');
const util = require('util');
const googleMaps = require('@google/maps');

const History = require('../schemas/history');
const Favorite = require('../schemas/favorite');

const router = express.Router();

/**
 * @google/maps 패키지로부터 구글 지도 클라이언트를 만드는 방법입니다.
 * createClient 메서드에 .env 파일로부터 키를 가져와서 속성값으로 넣어주면 됩니다.
 * 생성된 클라이언트에는 places, placesQueryAutoComplete, placeNearBy등의 메서드가 있습니다.
 */
const googleMapsClient = googleMaps.createClient({
    key: process.env.PLACES_API_KEY,
});

/* 메인화면을 보여주는 라우터 [ GET / ] */
router.get('/', (req, res) => {
    res.render('index');
});

/* 검색어 자동완성 라우터 [ GET /autocomplete/:query ] */
router.get('/autocomplete/:query', (req, res, next) => {
    googleMapsClient.placesQueryAutoComplete({
        input: req.params.query,
        language: 'ko',
    }, (err, response) => {
        if (err) {
            return next(err);
        }
        return res.json(response.json.predictions);     /* 결과는 response.json.predictions에 담겨 있습니다. */
    });
});

/* 장소 검색 라우터 [ GET /search/:query ] */
/* util.promisify를 사용한 이유 ..?
 * 구글 지도 클라이언트는 콜백 방식으로 동작하는데, 몽구스 프로미스와 같이 사용하기 
 * 위해 프로미스 패턴으로 바꾸어주었습니다. 
 * -> 이렇게 바꿀 수 있는 콜백들은 프로미스로 바꿔서, 최종적으로 async/await문법을 사용하는 것이 깔끔합니다.
 */
router.get('/search/:query', async (req, res, next) => {
    const googlePlaces = util.promisify(googleMapsClient.places);               // places메서드로 장소를 검색할 수 있습니다.
    const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
    const { lat, lng } = req.query;
    try {
        const history = new History({ query: req.params.query });   // 데이터베이스에 검색어를 저장
        await history.save();
        let response;
        if(lat && lng) {    // 쿼리스트링으로 lat과 lng이 제공되면,
            response = await googlePlacesNearby({
                keyword: req.params.query,  // 찾을 검색어
                location: `${lat},${lng}`,  // 위도와 경도
                rankby: 'distance',         // 정렬 순서 
                language: 'ko',             // 검색 언어 
            });
        } else {
            response = await googlePlaces({
                query: req.params.query,
                language: 'ko',
            });
        }
        res.render('result', {
            title: `${req.params.query} 검색 결과`,
            results: response.json.results,
            query: req.params.query,
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/* 즐겨찾기 추가를 위한 라우터 [ POST /location/:id/favorite ] */
router.post('/location/:id/favorite', async (req, res, next) => {
    try {
        const favorite = await Favorite.create({
            placeId: req.params.id,
            name: req.body.name,
            location: [req.body.lng, req.body.lat], // 경도, 위도 순으로 넣어야 한다는것에 주의하세요.
        });
        res.send(favorite);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;