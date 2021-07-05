const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require('cors');
const path = require('path');

const msalWrapper = require('../../../../msal-express-wrapper/dist/index');

const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const config = require('./authConfig');
const cache = require('./utils/cachePlugin');
const todolistRoutes = require('./routes/todolistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const routeGuard = require('./utils/routeGuard');

const app = express();

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

app.use(express.static(path.join(__dirname, './public')));

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * We need to enable CORS for client's domain in order to
 * expose www-authenticate header in response from web API
 */
app.use(cors({
    origin: "http://localhost:3000",
    exposedHeaders: "www-authenticate",
}));

/**
 * Using express-session middleware. Be sure to familiarize yourself with available options
 * and set them as desired. Visit: https://www.npmjs.com/package/express-session
 */
 const sessionConfig = {
    secret: 'ENTER_YOUR_SECRET_HERE',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set this to true on production
    }
}

if (app.get('env') === 'production') {

    /**
     * In App Service, SSL termination happens at the network load balancers, so all HTTPS requests reach your app as unencrypted HTTP requests.
     * The line below is needed for getting the correct absolute URL for redirectUri configuration. For more information, visit: 
     * https://docs.microsoft.com/azure/app-service/configure-language-nodejs?pivots=platform-linux#detect-https-session
     */

    app.set('trust proxy', 1) // trust first proxy e.g. App Service
    sessionConfig.cookie.secure = true // serve secure cookies
}

app.use(session(sessionConfig));

// =========== Initialize Passport ==============

const bearerOptions = {
    identityMetadata: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}/${config.metadata.discovery}`,
    issuer: `https://${config.metadata.authority}/${config.credentials.tenantID}/${config.metadata.version}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.clientID, // audience is this application
    validateIssuer: config.settings.validateIssuer,
    passReqToCallback: config.settings.passReqToCallback,
    loggingLevel: config.settings.loggingLevel,
    scope: ['access_as_user'] // scope you set during app registration
};

const bearerStrategy = new BearerStrategy(bearerOptions, (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
});

app.use(passport.initialize());

passport.use(bearerStrategy);

// exposes api endpoints
app.use('/api',
    passport.authenticate('oauth-bearer', { session: false }), // validate access tokens
    routeGuard, // check for auth context
    todolistRoutes
);

// =========== Initialize MSAL Wrapper==============

const appSettings = {
    appCredentials: {
        clientId: config.credentials.clientID,
        tenantId: config.credentials.tenantID,
        clientSecret: config.credentials.clientSecret
    },
    authRoutes: {
        redirect: "/admin/redirect", // enter the path component of the redirect URI
        error: "/admin/error", // the wrapper will redirect to this route in case of any error
        unauthorized: "/admin/unauthorized" // the wrapper will redirect to this route in case of unauthorized access attempt
    },
    remoteResources: {
        // Microsoft Graph beta authenticationContextClassReference endpoint. For more information,
        // visit: https://docs.microsoft.com/en-us/graph/api/resources/authenticationcontextclassreference?view=graph-rest-beta
        msGraphAcrs: {
            endpoint: "https://graph.microsoft.com/beta/identity/conditionalAccess/policies",
            scopes: ["Policy.ReadWrite.ConditionalAccess", "Policy.Read.ConditionalAccess"]
        },
    }
}

// instantiate the wrapper
const authProvider = new msalWrapper.AuthProvider(appSettings, cache);

// initialize the wrapper
app.use(authProvider.initialize());

// pass down to the authProvider instance to use in router
app.use('/admin',
    adminRoutes(authProvider)
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});