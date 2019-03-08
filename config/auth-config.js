'use strict';

const config = {
    sequelize: {
        user: process.env.SEQ_USER || 'user',
        password: process.env.SEQ_USER_PASS || 'password',
        server: process.env.SEQ_SERVER || 'localhost',
        database: process.env.SEQ_DB || 'DB',
        dialect: process.env.SEQ_DIALECT || 'mssql',
        port: Number(process.env.SEQ_PORT) || 1433,
        dialectOptions: {
            encrypt: true
        },
        pool: {
            min: 0,
            max: 5,
            idle: 10000,
            acquire: 30000,
            handleDisconnects: true
        }
    },
    kaseya: {
        redirectUrl: 'https://otto.itsupport.bot/auth/kaseya/callback'
    },
    luis: {
        authoringKey: process.env.LUIS_DEFAULT_AUTHORING_KEY,
        url: process.env.LUIS_API_URL,
        appId: process.env.LUIS_DEFAULT_APP_ID
    },
    keyVault: {
        uri: process.env.KEY_VAULT_URI || 'https://itsupportbot.vault.azure.net'
    }
};

module.exports = config;