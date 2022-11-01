const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const passport = require('passport');
const passportAzureAd = require('passport-azure-ad');
const NodeCache = require('node-cache');

const authConfig = require('./authConfig.json');
const router = require('./routes/router');
const routeGuard = require('./auth/guard');

/**
 * IMPORTANT: In case of overage, group list is cached for 1 hr by default, and thus cached groups 
 * will miss any changes to a users group membership for this duration. For capturing real-time 
 * changes to a user's group membership, consider implementing Microsoft Graph change notifications. 
 * For more information, visit: https://learn.microsoft.com/graph/api/resources/webhooks
 */
const nodeCache = new NodeCache({ 
    stdTTL: authConfig.cacheTTL, // in seconds
    checkperiod: 60 * 100,
    deleteOnExpire: true
});

const cacheProvider = require('./utils/cacheProvider')(nodeCache);

const app = express();
/**
 * Enable CORS middleware. In production, modify as to allow only designated origins and methods.
 * If you are using Azure App Service, we recommend removing the line below and configure CORS on the App Service itself.
 */
app.use(cors());

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const bearerStrategy = new passportAzureAd.BearerStrategy(
    {
        identityMetadata: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
        issuer: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}`,
        clientID: authConfig.credentials.clientID,
        audience: authConfig.credentials.clientID, // audience is this application
        validateIssuer: authConfig.settings.validateIssuer,
        passReqToCallback: authConfig.settings.passReqToCallback,
        loggingLevel: authConfig.settings.loggingLevel,
        loggingNoPII: authConfig.settings.loggingNoPII,
    },
    (token, done) => {
        /**
         * Below you can do extended token validation and check for additional claims, such as:
         * - check if the caller's tenant is in the allowed tenants list via the 'tid' claim (for multi-tenant applications)
         * - check if the caller's account is homed or guest via the 'acct' optional claim
         * - check if the caller belongs to right roles or groups via the 'roles' or 'groups' claim, respectively
         *
         * Bear in mind that you can do any of the above checks within the individual routes and/or controllers as well.
         * For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validate-the-user-has-permission-to-access-this-data
         */

        /**
         * Lines below verifies if the caller's client ID is in the list of allowed clients.
         * This ensures only the applications with the right client ID can access this API.
         * To do so, we use "azp" claim in the access token. Uncomment the lines below to enable this check.
         */

        const myAllowedClientsList = [
            /* add here the client IDs of the applications that are allowed to call this API */
            authConfig.credentials.clientID,
        ];

        if (!myAllowedClientsList.includes(token.azp)) {
            return done(new Error('Unauthorized'), {}, "Client not allowed");
        }

        /**
         * Access tokens that have neither the 'scp' (for delegated permissions) nor
         * 'roles' (for user roles or application permissions) claim are not to be honored.
         */
        if (!token.hasOwnProperty('scp') && !token.hasOwnProperty('roles')) {
            return done(new Error('Unauthorized'), null, 'No delegated or app permission claims found');
        }

        /**
         * If needed, pass down additional user info to route using the second argument below.
         * This information will be available in the req.user object.
         */
        return done(null, {}, token);
    }
);

app.use(passport.initialize());

passport.use(bearerStrategy);

// Validates token, checks for role and serve
app.use('/api', (req, res, next) => {
    passport.authenticate('oauth-bearer', { session: false }, (err, user, info) => {
        if (err) {
            /**
             * An error occurred during authorization. Either pass the error to the next function
             * for Express error handler to handle, or send a response with the appropriate status code.
             */
            return res.status(401).json({ error: err.message });
        }

        if (!user) {
            // If no user object found, send a 401 response.
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (info) {
            // access token payload will be available in req.authInfo downstream
            req.authInfo = info;
            return next();
        }
    })(req, res, next);
},

    routeGuard(authConfig.accessMatrix, cacheProvider),
    router,
    (err, req, res, next) => {
        /**
         * Add your custom error handling logic here. For more information, see:
         * http://expressjs.com/en/guide/error-handling.html
         */

        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // send error response
        res.status(err.status || 500).send(err);
    }
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

module.exports = app;
