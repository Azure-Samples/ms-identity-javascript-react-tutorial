# React single-page application using MSAL React to authorize users for calling a protected web API on Azure Active Directory

* [Overview](#overview)
* [Scenario](#scenario)
* [Contents](#contents)
* [Prerequisites](#prerequisites)
* [Setup the sample](#setup-the-sample)
* [Explore the sample](#explore-the-sample)
* [Troubleshooting](#troubleshooting)
* [About the code](#about-the-code)
* [Next Steps](#next-steps)
* [Contributing](#contributing)
* [Learn More](#learn-more)

## Overview

This sample demonstrates a React single-page application (SPA) calling a protected Node.js web API using the [Microsoft Authentication Library for React](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react) (MSAL React). The Node.js web API itself is protected using the [passport-azure-ad](https://github.com/AzureAD/passport-azure-ad) plug-in for [Passport.js](http://www.passportjs.org/).

Here you'll learn how to [register a protected web API](https://docs.microsoft.com/azure/active-directory/develop/scenario-protected-web-api-app-registration), [accept authorized calls](https://docs.microsoft.com/azure/active-directory/develop/scenario-protected-web-api-verification-scope-app-roles) and [validate access tokens](https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validating-tokens).

> :information_source: See the community call: [Implement authorization in your applications with the Microsoft identity platform](https://www.youtube.com/watch?v=LRoc-na27l0)

## Scenario

1. The client React SPA uses **MSAL React** to sign-in and obtain a JWT access token from **Azure AD**.
1. The access token is used as a bearer token to authorize the user to call the Node.js web API protected by **Azure AD**.
1. The protected web API responds with the signed-in user's todolist.

![Overview](./ReadmeFiles/topology.png)

## Contents

| File/folder         | Description                                         |
|---------------------|-----------------------------------------------------|
| `SPA/App.jsx`       | Main application logic resides here.                |
| `SPA/fetch.jsx`     | Provides helper methods for making fetch calls.     |
| `SPA/authConfig.js` | Contains authentication parameters for SPA project. |
| `API/config.js`     | Contains authentication parameters for API project. |
| `API/app.js`        | Main application logic of custom web API.             |
| `API/auth/permissionUtils.js` | Contains helper methods for ensuring client permissions. |

## Setup the sample

### Step 1: Install project dependencies

First, setup the service app:

```console
    cd ms-identity-javascript-react-tutorial
    cd 3-Authorization-II/1-call-api
    cd API
    npm install
```

Next, setup the client app:

```console
    cd ..
    cd SPA
    npm install
```

### Step 2: Register the sample application(s) in your tenant

There are two projects in this sample. Each needs to be separately registered in your Azure AD tenant. To register these projects, you can:

- follow the steps below for manually register your apps
- or use PowerShell scripts that:
  - **automatically** creates the Azure AD applications and related objects (passwords, permissions, dependencies) for you.
  - modify the projects' configuration files.

  <details>
   <summary>Expand this section if you want to use this automation:</summary>

    > :warning: If you have never used **Microsoft Graph PowerShell** before, we recommend you go through the [App Creation Scripts Guide](./AppCreationScripts/AppCreationScripts.md) once to ensure that your environment is prepared correctly for this step.
  
    1. On Windows, run PowerShell as **Administrator** and navigate to the root of the cloned directory
    1. In PowerShell run:

       ```PowerShell
       Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
       ```

    1. Run the script to create your Azure AD application and configure the code of the sample application accordingly.
    1. For interactive process -in PowerShell, run:

       ```PowerShell
       cd .\AppCreationScripts\
       .\Configure.ps1 -TenantId "[Optional] - your tenant id" -AzureEnvironmentName "[Optional] - Azure environment, defaults to 'Global'"
       ```

    > Other ways of running the scripts are described in [App Creation Scripts guide](./AppCreationScripts/AppCreationScripts.md). The scripts also provide a guide to automated application registration, configuration and removal which can help in your CI/CD scenarios.

  </details>

#### Choose the Azure AD tenant where you want to create your applications

As a first step you'll need to:

1. Sign in to the [Azure portal](https://portal.azure.com).
1. If your account is present in more than one Azure AD tenant, select your profile at the top right corner in the menu on top of the page, and then **switch directory** to change your portal session to the desired Azure AD tenant.

#### Register the service app (msal-node-api)

1. Navigate to the [Azure portal](https://portal.azure.com) and select the **Azure Active Directory** service.
1. Select the **App Registrations** blade on the left, then select **New registration**.
1. In the **Register an application page** that appears, enter your application's registration information:
    1. In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `msal-node-api`.
    1. Under **Supported account types**, select **Accounts in this organizational directory only**
    1. Select **Register** to create the application.
1. In the **Overview** blade, find and note the **Application (client) ID**. You use this value in your app's configuration file(s) later in your code.
1. In the app's registration screen, select the **Expose an API** blade to the left to open the page where you can publish the permission as an API for which client applications can obtain [access tokens](https://aka.ms/access-tokens) for. The first thing that we need to do is to declare the unique [resource](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow) URI that the clients will be using to obtain access tokens for this API. To declare an resource URI(Application ID URI), follow the following steps:
    1. Select **Set** next to the **Application ID URI** to generate a URI that is unique for this app.
    1. For this sample, accept the proposed Application ID URI (`api://{clientId}`) by selecting **Save**. Read more about Application ID URI at [Validation differences by supported account types \(signInAudience\)](https://docs.microsoft.com/azure/active-directory/develop/supported-accounts-validation).
 
##### Publish Delegated Permissions

1. All APIs must publish a minimum of one [scope](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code), also called [Delegated Permission](https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#permission-types), for the client's to obtain an access token for a *user* successfully. To publish a scope, follow these steps:
1. Select **Add a scope** button open the **Add a scope** screen and Enter the values as indicated below:
    1. For **Scope name**, use `Todolist.Read`.
    1. Select **Admins and users** options for **Who can consent?**.
    1. For **Admin consent display name** type in the details, `e.g. Allows to read Todolist items`.
    1. For **Admin consent description** type in the details `e.g. Allow the app to read Todolist items on your behalf.`
    1. For **User consent display name** type in the details `e.g. Allows to read Todolist items`.
    1. For **User consent description** type in the details `e.g. Allow the app to read Todolist items on your behalf.`
    1. Keep **State** as **Enabled**.
    1. Select the **Add scope** button on the bottom to save this scope.
    > Repeat the steps above for another scope named **Todolist.ReadWrite**
1. Select the **Manifest** blade on the left.
    1. Set `accessTokenAcceptedVersion` property to **2**.
    1. Select on **Save**.

> :information_source: Be aware of [the principle of least privilege](https://docs.microsoft.com/azure/active-directory/develop/secure-least-privileged-access) whenever you are publishing permissions for a web API.

##### Publish Application Permissions

1. All APIs should publish a minimum of one [App role](https://docs.microsoft.com/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps#assign-app-roles-to-applications), also called [Application Permission](https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#permission-types), for the client apps to obtain an access token as *themselves*, i.e. when they are not signing-in a user. **Application permissions** are the type of permissions that APIs should publish when they want to enable client applications to successfully authenticate as themselves and not need to sign-in users. To publish an application permission, follow these steps:
1. Still on the same app registration, select the **App roles** blade to the left.
1. Select **Create app role**:
    1. For **Display name**, enter a suitable name for your application permission, for instance **Todolist.Read.All**.
    1. For **Allowed member types**, choose **Application** to ensure other applications can be granted this permission.
    1. For **Value**, enter **Todolist.Read.All**.
    1. For **Description**, enter **Allow this application to read every users Todo list items**.
    1. Select **Apply** to save your changes.
    > Repeat the steps above for another app permission named **Todolist.ReadWrite.All**

> :information_source: See how to use **application permissions** in a client app here: [Node.js console application acquiring tokens using OAuth 2.0 Client Credentials Grant](https://github.com/Azure-Samples/ms-identity-javascript-nodejs-console).

##### Configure Optional Claims

1. Still on the same app registration, select the **Token configuration** blade to the left.
1. Select **Add optional claim**:
    1. Select **optional claim type**, then choose **Access**.
    1. Select the optional claim **idtyp**.
    1. Select **Add** to save your changes.

##### Configure the service app (msal-node-api) to use your app registration

Open the project in your IDE (like Visual Studio or Visual Studio Code) to configure the code.

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `API\authConfig.js` file.
1. Find the key `Enter_the_Application_Id_Here` and replace the existing value with the application ID (clientId) of `msal-node-api` app copied from the Azure portal.
1. Find the key `Enter_the_Tenant_Info_Here` and replace the existing value with your Azure AD tenant ID.

#### Update the client app registration (msal-react-spa)

1. Navigate to the [Azure portal](https://portal.azure.com) and select the **Azure AD** service.
1. Select the **App Registrations** blade on the left, then find and select the application that you have registered in the previous tutorial (`msal-react-spa`).
1. In the app's registration screen, select the **API permissions** blade in the left to open the page where we add access to the APIs that your application needs.
    1. Select the **Add a permission** button and then,
        1. Ensure that the **My APIs** tab is selected.
        1. In the list of APIs, select the API `msal-node-api`.
        1. In the **Delegated permissions** section, select the **Todolist.Read** and **Todolist.ReadWrite** in the list. Use the search box if necessary.
        1. Select the **Add permissions** button at the bottom.

##### Configure the client app (msal-react-spa) to use your app registration

Open the project in your IDE (like Visual Studio or Visual Studio Code) to configure the code.

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `SPA\src\authConfig.js` file.
1. Find the key `Enter_the_Application_Id_Here` and replace the existing value with the application ID (clientId) of `msal-react-spa` app copied from the Azure portal.
1. Find the key `Enter_the_Tenant_Info_Here` and replace the existing value with your Azure AD tenant ID.
1. Find the key `Enter_the_Web_Api_Application_Id_Here` and replace the existing value with APP ID URI of the web API project that you've registered earlier, e.g. `api://<msal-node-api-client-id>/Todolist.Read`

### Step 4: Running the sample

From your shell or command line, execute the following commands to run the service app::

```console
    cd 3-Authorization-II/1-call-api/API
    npm start
```

In a separate terminal, run the client app:

```console
    cd 3-Authorization-II/1-call-api/SPA
    npm start
```

## Explore the sample

1. Open your browser and navigate to `http://localhost:3000`.
1. Select the **Sign In** button on the top right corner. Choose either **Popup** or **Redirect** flows.
1. Select the **Todolist** button on the navigation bar. This will make a call to the Todolist web API.

![Screenshot](./ReadmeFiles/screenshot.png)

> :information_source: Did the sample not work for you as expected? Then please reach out to us using the [GitHub Issues](../../../issues) page.

## We'd love your feedback!

Were we successful in addressing your learning objective? Consider taking a moment to [share your experience with us](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR73pcsbpbxNJuZCMKN0lURpUMlRHSkc5U1NLUkxFNEtVN0dEOTFNQkdTWiQlQCN0PWcu).

## Troubleshooting

Use [Stack Overflow](http://stackoverflow.com/questions/tagged/msal) to get support from the community. Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before. Make sure that your questions or comments are tagged with [`azure-active-directory` `react` `ms-identity` `adal` `msal`].

If you find a bug in the sample, raise the issue on [GitHub Issues](../../../../issues).

## About the code

### CORS settings

For the purpose of the sample, **cross-origin resource sharing** (CORS) is enabled for **all** domains and methods, using the Express.js cors middleware. This is insecure and only used for demonstration purposes here. In production, you should modify this as to allow only the domains that you designate. If your web API is going to be hosted on **Azure App Service**, we recommend configuring CORS on the App Service itself.

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
```

### Access token validation

On the web API side, [passport-azure-ad](https://github.com/AzureAD/passport-azure-ad) verifies the incoming access token's signature and validates it's payload against the `issuer` and `audience` claims (defined in `BearerStrategy` constructor) using the `passport.authenticate()` API. In the `BearerStrategy` callback, you can add further validation steps as shown below:

```javascript
const express = require('express');
const passport = require('passport');
const passportAzureAd = require('passport-azure-ad');

const app = express();

const bearerStrategy = new passportAzureAd.BearerStrategy({
    identityMetadata: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
    issuer: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}`,
    clientID: authConfig.credentials.clientID,
    audience: authConfig.credentials.clientID, // audience is this application
    validateIssuer: authConfig.settings.validateIssuer,
    passReqToCallback: authConfig.settings.passReqToCallback,
    loggingLevel: authConfig.settings.loggingLevel,
    loggingNoPII: authConfig.settings.loggingNoPII,
}, (req, token, done) => {
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
     * Below we verify if the caller's tenant ID is in the list of allowed tenants.
     * Since this app is not configured to be multi-tenant, this is only for illustration
     */
    const myAllowedTenantsList = [
        authConfig.credentials.tenantID,
        // ...
    ]

    if (!myAllowedTenantsList.includes(authConfig.credentials.tenantID)) {
        return done(new Error('Unauthorized'), {}, "Tenant not allowed");
    }

    /**
     * Below we verify if there's at least one allowed permission in the access token
     * to be considered valid.
     */
    if (!requiredScopeOrAppPermission(token, [
        ...authConfig.protectedRoutes.todolist.delegatedPermissions.read,
        ...authConfig.protectedRoutes.todolist.delegatedPermissions.write,
        ...authConfig.protectedRoutes.todolist.applicationPermissions.read,
        ...authConfig.protectedRoutes.todolist.applicationPermissions.write,
    ])) {
        return done(new Error('Unauthorized'), {}, "No delegated or app permission found");
    }

    /**
     * If needed, pass down additional user info to route using the second argument below.
     * This information will be available in the req.user object.
     */
    done(null, {}, token);
});

app.use(passport.initialize());

passport.use(bearerStrategy);

// exposed API endpoint
app.use('/api',
    passport.authenticate('oauth-bearer', {
        session: false,
    }),
    router
);
```

For validation and debugging purposes, developers can decode **JWT**s (*JSON Web Tokens*) using [jwt.ms](https://jwt.ms).

### Verifying permissions

Access tokens that have neither the **scp** (for delegated permissions) nor **roles** (for application permissions) claim should not be accepted. In the sample, this is illustrated via the `requiredScopeOrAppPermission` method in [permissionUtils.js](./API/auth/permissionUtils.js)

```JavaScript
exports.requiredScopeOrAppPermission = (accessTokenPayload, listOfPermissions) => {
    /**
     * Access tokens that have neither the 'scp' (for delegated permissions) nor
     * 'roles' (for application permissions) claim are not to be honored.
     *
     * An access token issued by Azure AD will have at least one of the two claims. Access tokens
     * issued to a user will have the 'scp' claim. Access tokens issued to an application will have
     * the roles claim. Access tokens that contain both claims are issued only to users, where the scp
     * claim designates the delegated permissions, while the roles claim designates the user's role.
     *
     * To determine whether an access token was issued to a user (i.e delegated) or an application
     * more easily, we recommend enabling the optional claim 'idtyp'. For more information, see:
     * https://docs.microsoft.com/azure/active-directory/develop/access-tokens#user-and-application-tokens
     */

    if (!accessTokenPayload.hasOwnProperty('scp') && !accessTokenPayload.hasOwnProperty('roles')) {
        return false;
    } else if (accessTokenPayload.hasOwnProperty('roles') && !accessTokenPayload.hasOwnProperty('scp')) {
        return this.hasApplicationPermissions(accessTokenPayload, listOfPermissions);
    } else if (accessTokenPayload.hasOwnProperty('scp')) {
        return this.hasDelegatedPermissions(accessTokenPayload, listOfPermissions);
    }
}
```

### Access to data

Web API endpoints should be prepared to accept calls from both users and applications, and should have control structures in place to respond each accordingly. This is illustrated in the [todolist](./API/controllers/todolist.js) controller:

```JavaScript
exports.getTodo = (req, res, next) => {
    if (hasDelegatedPermissions(req.authInfo, authConfig.protectedRoutes.todolist.delegatedPermissions.read)) {
        try {
            /**
             * The 'oid' (object id) is the only claim that should be used to uniquely identify
             * a user in an Azure AD tenant.
             */
            const owner = req.authInfo['oid'];
            const id = req.params.id;

            const todo = db.get('todos')
                .filter({ owner: owner })
                .find({ id: id })
                .value();

            res.status(200).send(todo);
        } catch (error) {
            next(error);
        }
    } else if (hasApplicationPermissions(req.authInfo, authConfig.protectedRoutes.todolist.applicationPermissions.read)) {
        try {
            const id = req.params.id;

            const todo = db.get('todos')
                .find({ id: id })
                .value();

            res.status(200).send(todo);
        } catch (error) {
            next(error);
        }
    } else (
        next(new Error('The user or application does not have the required permission(s)'))
    )
}
```

When granting access to data based on scopes, be sure to follow [the principle of least privilege](https://docs.microsoft.com/azure/active-directory/develop/secure-least-privileged-access).

## Next Tutorial

Continue with the next tutorial: [Deploy your apps to Azure](../../4-Deployment/2-deploy-static/README.md).

## Contributing

If you'd like to contribute to this sample, see [CONTRIBUTING.MD](/CONTRIBUTING.md).

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Learn More

- [Microsoft identity platform (Azure Active Directory for developers)](https://docs.microsoft.com/azure/active-directory/develop/)
- [Overview of Microsoft Authentication Library (MSAL)](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)
- [Quickstart: Register an application with the Microsoft identity platform](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app)
- [Quickstart: Configure a client application to access web APIs](https://docs.microsoft.com/azure/active-directory/develop/quickstart-configure-app-access-web-apis)
- [Initialize client applications using MSAL.js](https://docs.microsoft.com/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Single sign-on with MSAL.js](https://docs.microsoft.com/azure/active-directory/develop/msal-js-sso)
- [Handle MSAL.js exceptions and errors](https://docs.microsoft.com/azure/active-directory/develop/msal-handling-exceptions?tabs=javascript)
- [Logging in MSAL.js applications](https://docs.microsoft.com/azure/active-directory/develop/msal-logging?tabs=javascript)
- [Pass custom state in authentication requests using MSAL.js](https://docs.microsoft.com/azure/active-directory/develop/msal-js-pass-custom-state-authentication-request)
- [Prompt behavior in MSAL.js interactive requests](https://docs.microsoft.com/azure/active-directory/develop/msal-js-prompt-behavior)
