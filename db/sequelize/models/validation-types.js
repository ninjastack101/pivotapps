'use strict';

module.exports = (sequelize, DataTypes) => {
    const ValidationType = sequelize.define('ValidationType', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        }
    },{
        tableName: 'validationTypes'
    });

    /* ValidationType.associate = models => {

    }; */

    return ValidationType;
};
