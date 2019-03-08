'use strict';

const fs = require('fs');
const cors = require('cors');

if (fs.existsSync('.env')) {
    require('dotenv').config();
}

const appInsights = require('./appinsights/client');
appInsights.start();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hpp = require('hpp');
const helmet = require('helmet');
const jwtCheck = require('./middlewares/jwt-check');
const adminCheck = require('./middlewares/admin-check');

const userProfileRoutes = require('./routes/user-profile');
const skillRoutes = require('./routes/skills');
const departmentRoutes = require('./routes/departments');
const categoryRoutes = require('./routes/categories');
const subCategoryRoutes = require('./routes/sub-categories');
const botPersonaRoutes = require('./routes/bot-personas');
const urlRedirectRoutes = require('./routes/url-redirects');
const kaseyaRoutes = require('./routes/kaseya');
const companyRoutes = require('./routes/companies');
const companyDepartmentRoutes = require('./routes/company-departments');
const userRoutes = require('./routes/users');
const luisRoutes = require('./routes/luis');
const roleRoutes = require('./routes/roles');
const sharedUserCompanyRoutes = require('./routes/shared-usercompanies');
const qnaRoutes = require('./routes/qna');
const ticketConfigurationRoutes = require('./routes/ticket-configurations');
const publishRoutes = require('./routes/publish');
const apiSkillRoutes = require('./routes/api-skills');
const skillQuestions = require('./routes/questions');
const kaseyaSkillRoutes = require('./routes/kaseya-skills');
const variableRoutes = require('./routes/variables');
const messageRoutes = require('./routes/messages');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(cors());
}

app.enable('trust proxy');

app.use((req, res, next) => {
    if (req.headers['x-arr-ssl'] && !req.headers['x-forwarded-proto']) {
        req.headers['x-forwarded-proto'] = 'https';
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

// Use helmet to secure Express headers
app.use(helmet());
app.disable('x-powered-by');

app.use(hpp());

app.use('/me', jwtCheck, adminCheck, userProfileRoutes);
app.use('/api/skills', jwtCheck, adminCheck, skillRoutes);
app.use('/api/departments', jwtCheck, adminCheck, departmentRoutes);
app.use('/api/categories', jwtCheck, adminCheck, categoryRoutes);
app.use('/api/sub-categories', jwtCheck, adminCheck, subCategoryRoutes);
app.use('/api/botpersonas', jwtCheck, adminCheck, botPersonaRoutes);
app.use('/api/url-redirects', jwtCheck, adminCheck, urlRedirectRoutes);
app.use('/api/kaseya', jwtCheck, adminCheck, kaseyaRoutes);
app.use('/api/companies', jwtCheck, adminCheck, companyRoutes);
app.use('/api/companydepartments', jwtCheck, adminCheck, companyDepartmentRoutes);
app.use('/api/users', jwtCheck, adminCheck, userRoutes);
app.use('/api/luis', jwtCheck, adminCheck, luisRoutes);
app.use('/api/roles', jwtCheck, adminCheck, roleRoutes);
app.use('/api/shared-usercompanies', jwtCheck, adminCheck, sharedUserCompanyRoutes);
app.use('/api/qna', jwtCheck, adminCheck, qnaRoutes);
app.use('/api/ticket-configurations', jwtCheck, adminCheck, ticketConfigurationRoutes);
app.use('/api/publish', jwtCheck, adminCheck, publishRoutes);
app.use('/api/api-skills', jwtCheck, adminCheck, apiSkillRoutes);
app.use('/api/kaseya-skills', jwtCheck, adminCheck, kaseyaSkillRoutes);
app.use('/api/questions', jwtCheck, adminCheck, skillQuestions);
app.use('/api/variables', jwtCheck, adminCheck, variableRoutes);
app.use('/api/messages', jwtCheck, adminCheck, messageRoutes);

// Forward requests to Angular index html file. Renamed to angular.html in this case to avoid webserver.
app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
        res.sendFile('./dist/angular.html', { root: __dirname });
    } else {
        next();
    }
});

// Catch JWT Token error
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({
            message: 'Unauthorized'
        });
    } else {
        next(err);
    }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
