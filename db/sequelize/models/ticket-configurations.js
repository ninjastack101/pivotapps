'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const TicketConfiguration = sequelize.define('TicketConfiguration', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__ticketConfig__skillId__compId',
            references: {
                model: 'skills',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__ticketConfig__skillId__compId',
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        createTicket: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        billable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        timeToLog: {
            type: DataTypes.STRING(5),
            allowNull: true
        },
        technicianName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        serviceBoardName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        includeChatInDescription: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        logStartEndTime: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        priority: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        subType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        includeAssetName: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        agreementName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        workRole: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'ticketConfigurations'
    });

    TicketConfiguration.associate = models => {
        TicketConfiguration.belongsTo(models.Company, {
            foreignKey: 'companyId',
            targetKey: 'id',
            as: 'company'
        });

        TicketConfiguration.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return TicketConfiguration;
};
