const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const passport = require('passport');
const passportAzureAd = require('passport-azure-ad');

const authConfig = require('./authConfig');
const router = require('./routes/router');

const routeGuard = require('./utils/guard');

const { requiredScopesOrAppPermissions } = require('./auth/permissionUtils');

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
    (req, token, done) => {
        /**
         * Below you can do extended token validation and check for additional claims, such as:
         * - check if the caller's tenant is in the allowed tenants list via the 'tid' claim (for multi-tenant applications)
         * - check if the caller's account is homed or guest via the 'acct' optional claim
         * - check if the caller belongs to right roles or groups via the 'roles' or 'groups' claim, respectively
         *
         * Bear in mind that you can do any of the above checks within the individual routes and/or controllers as well.
         * For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validate-the-user-has-permission-to-access-this-data
         */
        if (
            requiredScopesOrAppPermissions(token, [
                ...authConfig.protectedRoutes.todolist.delegatedPermissions.read,
                ...authConfig.protectedRoutes.todolist.delegatedPermissions.write,
                ...authConfig.protectedRoutes.todolist.applicationPermissions.read,
                ...authConfig.protectedRoutes.todolist.applicationPermissions.write,
            ])
        ) {
            /**
             * If needed, pass down additional user info to route using the second argument below.
             * This information will be available in the req.user object.
             */
            return done(null, {}, token);
        } else {
            return done(new Error('Unauthorized'), {}, 'Unauthorized');
        }
    }
);

app.use(passport.initialize());

passport.use(bearerStrategy);

// Validates token, checks for role and serve
app.use(
    '/api',
    passport.authenticate('oauth-bearer', {
        session: false,
        /**
         * If you are building a multi-tenant application and you need supply the tenant ID or name dynamically, uncomment
         * the line below and pass in the tenant information. For more information, see:
         * https://github.com/AzureAD/passport-azure-ad#423-options-available-for-passportauthenticate
         */

        // tenantIdOrName: <some-tenant-id-or-name>
    }),
    routeGuard(authConfig.accessMatrix, authConfig.protectedRoutes.todolist.applicationPermissions.read),
    router
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

module.exports = app;
