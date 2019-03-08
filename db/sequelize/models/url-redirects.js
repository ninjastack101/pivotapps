'use strict';

module.exports = (sequelize, DataTypes) => {
    const UrlRedirect = sequelize.define('UrlRedirect', {
        url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        urlName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'skills',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }
    },{
        tableName: 'urlRedirects',
        timestamps: false
    });

    UrlRedirect.associate = models => {
        UrlRedirect.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return UrlRedirect;
};