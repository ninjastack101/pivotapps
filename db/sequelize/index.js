'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../config/auth-config');

const sequelize = new Sequelize(config.sequelize.database, config.sequelize.user, config.sequelize.password, {
    logging: config.sequelize.logging,
    host: config.sequelize.server,
    dialect: config.sequelize.dialect,
    port: config.sequelize.port,
    pool: config.sequelize.pool,
    dialectOptions: process.env.ENABLE_DIALECT_OPTIONS === 'true' ? config.sequelize.dialectOptions : { encrypt: false }
});

const db = {};
const modelsDir = `${__dirname}/models`;

fs.readdirSync(modelsDir)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach(file => {
        var model = sequelize.import(path.join(modelsDir, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
