const express = require("express");
const path = require("path");
const app = express();
const appSettings = require('./appSettings.js');


const expressSession = require('express-session');
const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;
const mainRouter = require('./routes/mainRoutes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.urlencoded({ extended: false }));


app.use(expressSession({
    secret: appSettings.appCredentials.clientSecret,
    resave: false,
    saveUninitialized: false
}));



const bearerOptions = {
    identityMetadata: `https://login.microsoftonline.com/${appSettings.appCredentials.tenantId}/v2.0/.well-known/openid-configuration`,
    issuer: `https://login.microsoftonline.com/${appSettings.appCredentials.tenantId}/v2.0`,
    clientID: appSettings.appCredentials.clientId,
    audience: appSettings.appCredentials.clientId, // audience is this application
    validateIssuer: true,
    passReqToCallback: false,
    loggingLevel: "info",
    scope: appSettings.protectedRoutes.hello.scopes // scope you set during app registration
}


const bearerStrategy = new BearerStrategy(bearerOptions, (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
});

app.use(passport.initialize());

passport.use(bearerStrategy);

app.use('/api/hello',
    passport.authenticate('oauth-bearer', { session: false }), // validate access tokens    
);


const port = process.env.PORT || 5000;


app.use(mainRouter(__dirname));
app.listen(port);


console.log('App is listening on port ' + port);
