const path = require('path');
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname,'..','config','config.json'))[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// user, comment 모델을 생성후, index.js와 연결합니다.
db.User = require('./user')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);

// users 테이블과 comments 테이블의 관계를 정의
db.User.hasMany(db.Comment, { foreignKey:'commenter', sourceKey:'id'}); // hasMany: 1대N 관계 
db.Comment.belongsTo(db.User, { foreignKey:'commenter', targetKey:'id'}); // belongsTo : N대1 관계

module.exports = db;
