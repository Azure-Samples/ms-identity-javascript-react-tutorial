const express = require('express');
const cors = require('cors');
const passport = require('passport');

const config = require('./authConfig');
const router = require('./routes/router');
const routeGuard = require('./utils/guard');

const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const options = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.clientID, // audience is this application
    validateIssuer: config.settings.validateIssuer,
    passReqToCallback: config.settings.passReqToCallback,
    loggingLevel: config.settings.loggingLevel,
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
});

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    exposedHeaders: "www-authenticate",
}));

app.use(passport.initialize());

passport.use(bearerStrategy);

// Validates token, checks for role and serve
app.use('/api',
    passport.authenticate('oauth-bearer', { session: false }),
    routeGuard(config.accessMatrix),
    router
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});