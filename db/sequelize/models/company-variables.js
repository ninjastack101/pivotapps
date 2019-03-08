'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const CompanyVariable = sequelize.define('CompanyVariable', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isSecret: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'companyVariables',
        timestamps: false
    });

    CompanyVariable.associate = models => {
        CompanyVariable.belongsTo(models.Skill, {
            foreignKey: 'companyId',
            targetKey: 'id',
            as: 'company'
        });
    };

    return CompanyVariable;
};
