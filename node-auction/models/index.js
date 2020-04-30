const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Good = require('./good')(sequelize, Sequelize);
db.Auction = require('./auction')(sequelize, Sequelize);

/* hasMany: 1대 N,  belongsTo: N대 1 */
db.Good.belongsTo(db.User, { as: 'owner' });  // 사용자가 여러 상품을 등록할 수 있다 (owernerId 컬럼으로 상품 모델에 추가된다)
db.Good.belongsTo(db.User, { as: 'sold' });   // 사용자가 여러 상품을 낙찰받을 수 있다 (soldId 컬럼으로 상품 모델에 추가된다)
db.User.hasMany(db.Auction);                  // 사용자가 입찰을 여러번 가능
db.Good.hasMany(db.Auction);                  // 한 상품에 여러 명이 입찰 가능  
db.Auction.belongsTo(db.User);                // 제로초님 질문 답변 : 
db.Auction.belongsTo(db.Good);                // 제로초님 질문 답변 : 

module.exports = db;
