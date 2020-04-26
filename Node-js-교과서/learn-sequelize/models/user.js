/* 시퀄라이즈는 기본적으로 모델 이름은 단수형으로, 테이블 이름은 복수형으로 사용한다. */
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {   /* 시퀄라이즈는 자동으로 define 메서드의 첫번째 인자를 복수형으로 만든다. */
        /* 시퀄라이즈는 알아서 id를 기본 키로 연결하므로 id컬럼은 적어줄 필요가 없다. */
        name: {
            type: DataTypes.STRING(20), // VARCHAR
            allowNull: false,
            unique: true,
        },
        age: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        married: {
            type: DataTypes.BOOLEAN,    // TINYINT
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,   // DATETIME
            allowNull: false,
            defaultValue: sequelize.literal('now()'),
        },
    }, {
        timestamps: false,  // 날짜 컬럼 추가 기능 : 해제 
    });
};