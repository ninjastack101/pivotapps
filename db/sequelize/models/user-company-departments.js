'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserCompanyDepartment = sequelize.define('UserCompanyDepartment', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        companyDepartmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'companyDepartments',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    },{
        tableName: 'userCompanyDepartments'
    });

    UserCompanyDepartment.associate = models => {
        UserCompanyDepartment.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' });
        UserCompanyDepartment.belongsTo(models.CompanyDepartment, { foreignKey: 'companyDepartmentId', targetKey: 'id' });
    };

    return UserCompanyDepartment;
};
