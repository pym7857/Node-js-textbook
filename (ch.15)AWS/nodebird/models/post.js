module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', {
        content: {
            type: DataTypes.STRING(140),
            allowNull: false,
        },
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
        // 배포 환경에서 데이터베이스에 한글이 저장되지 않는 문제가 발생할 수 도 있기 때문에 넣어준다.
        charset:'utf8',             
        collate:'utf8_general_ci',
    })
);