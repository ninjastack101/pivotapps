'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanyBotPersona = sequelize.define('CompanyBotPersona', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        botPersonaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'botPersonas',
                key: 'id'
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },{
        tableName: 'companyBotPersonas'
    });

    CompanyBotPersona.associate = models => {
        CompanyBotPersona.belongsTo(models.Company, { foreignKey: 'companyId', targetKey: 'id' });
        CompanyBotPersona.belongsTo(models.BotPersona, { foreignKey: 'botPersonaId', targetKey: 'id' });
    };

    return CompanyBotPersona;
};
