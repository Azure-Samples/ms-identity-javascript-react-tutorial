const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');

const config = require('./authConfig');
const validatePoP = require('./utils/validateToken');
const router = require('./routes/router');

const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const options = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://sts.windows.net/${config.credentials.tenantID}/`,
    clientID: config.credentials.clientID,
    audience: 'api://' + config.credentials.clientID, // audience is this application
    validateIssuer: config.settings.validateIssuer,
    passReqToCallback: config.settings.passReqToCallback,
    loggingLevel: config.settings.loggingLevel,
    scope: config.protectedRoutes.todolist.scopes
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
});

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.use(passport.initialize());

passport.use(bearerStrategy);

app.use('/api',
    validatePoP, // validates pop token
    passport.authenticate('oauth-bearer', { session: false }), // validates raw access token
    router
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

module.exports = app;