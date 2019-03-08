'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const BotPersona = sequelize.define('BotPersona', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePhoto: {
            type: DataTypes.STRING,
            allowNull: true
        },
        specialized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'botPersonas',
        timestamps: false
    });

    BotPersona.associate = models => {
        BotPersona.hasMany(models.UserUtil, { foreignKey: 'preferredBotPersonaId', targetKey: 'id' });

        BotPersona.belongsToMany(models.Company, {
            through: 'CompanyBotPersona',
            as: 'companies',
            foreignKey: 'botPersonaId'
        });
    };

    return BotPersona;
};
