'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const Company = sequelize.define('Company', {
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
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        domainNames: {
            type: DataTypes.STRING,
            allowNull: true
        },
        preferredBotPersonaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'botPersonas',
                key: 'id'
            }
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        luisAuthoringKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isMSP: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        mspCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            index: 'IX__companies__mspCompanyId',
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        companyIdentifier: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'companies'
    });

    Company.associate = models => {
        Company.hasOne(models.KaseyaHost, { foreignKey: 'companyId', as: 'kaseyaHost' });
        Company.hasMany(models.ConnectwiseHost, { foreignKey: 'companyId' });

        Company.hasMany(models.CompanyApiKey, { foreignKey: 'companyId', as: 'apiKeys' });

        Company.belongsTo(models.BotPersona, {
            foreignKey: 'preferredBotPersonaId',
            as: 'preferredBotPersona'
        });

        Company.belongsToMany(models.User, {
            through: 'UserCompany',
            as: 'users',
            foreignKey: 'companyId'
        });

        Company.belongsToMany(models.Department, {
            through: {
                model: 'CompanyDepartment',
                unique: false
            },
            as: 'departments',
            foreignKey: 'companyId'
        });

        Company.belongsToMany(models.DepartmentCategory, {
            through: 'CompanyDepartmentCategory',
            as: 'categories',
            foreignKey: 'companyId'
        });

        Company.belongsToMany(models.DepartmentSubCategory, {
            through: 'CompanyDepartmentSubCategory',
            as: 'subCategories',
            foreignKey: 'companyId'
        });

        Company.belongsToMany(models.BotPersona, {
            through: 'CompanyBotPersona',
            as: 'botPersonas',
            foreignKey: 'companyId'
        });

        Company.hasMany(Company, {
            as: 'mspManagedCompanies',
            foreignKey: 'mspCompanyId'
        });

        Company.belongsTo(Company, {
            as: 'mspCompanyInfo',
            foreignKey: 'id'
        });
    };

    return Company;
};
