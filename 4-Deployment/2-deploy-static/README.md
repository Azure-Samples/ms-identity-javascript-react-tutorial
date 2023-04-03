# Deploy your React Application to Azure Cloud and use Azure services to manage your operations

 1. [Overview](#overview)
 1. [Scenario](#scenario)
 1. [Prerequisites](#prerequisites)
 1. [Registration](#registration)
 1. [Deployment](#deployment)
 1. [Explore the sample](#explore-the-sample)
 1. [About the code](#about-the-code)
 1. [More information](#more-information)
 1. [Community Help and Support](#community-help-and-support)
 1. [Contributing](#contributing)
 1. [Code of Conduct](#code-of-conduct)

## Overview

This sample demonstrates how to deploy a React single-page application (SPA) coupled with a Node.js [Azure Function](https://docs.microsoft.com/azure/azure-functions/) API to **Azure Cloud** using the [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/) service.

The Azure Function API here calls Microsoft Graph using the [on-behalf-of flow](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow) and returns the response back to the React SPA.

The SPA component uses [Microsoft Authentication Library for React](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react) (MSAL React) to sign-in a user and acquire an access token, while the Function API uses [Microsoft Authentication Library for Node.js](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) (MSAL Node) to exchange the user's access token for a new access token to call the Graph API.

## Scenario

1. The client application uses **MSAL React** to sign-in a user and obtain a JWT **Access Token** from **Azure AD**.
1. The **Access Token** is sent over to Function API using a **POST** request.
1. The Function API responds validates the **Access Token** and then obtains a new access token from Azure AD
1. The Function API uses the new **Access Token** as a **bearer** token to the **Microsoft Graph API**.
1. **The Microsoft Graph API** responds and the Function API propagates it back to the client application.

![Overview](./ReadmeFiles/topology.png)

## Prerequisites

- [VS Code Azure Static Web Apps Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) extension is recommended for interacting with **Azure** through VS Code interface.
- An **Azure subscription**. This sample uses **Azure Static Web Apps**.

## Registration

### Choose the Azure AD tenant where you want to create your applications

As a first step you'll need to:

1. Sign in to the [Azure portal](https://portal.azure.com).
1. If your account is present in more than one Azure AD tenant, select your profile at the top right corner in the menu on top of the page, and then **switch directory** to change your portal session to the desired Azure AD tenant.

### Register the app

> :information_source: Below, we are using a single app registration for both SPA and function API components.

1. Navigate to the [Azure portal](https://portal.azure.com) and select the **Azure AD** service.
1. Select the **App Registrations** blade on the left, then select **New registration**.
1. In the **Register an application page** that appears, enter your application's registration information:
   - In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `msal-react-spa`.
   - Under **Supported account types**, select **Accounts in this organizational directory only**.
   - In the **Redirect URI** section, select **Single-page application** in the combo-box and enter the following redirect URI: `http://localhost:3000/`.
1. Select **Register** to create the application.
1. In the app's registration screen, find and note the **Application (client) ID**. You use this value in your app's configuration file(s) later in your code.
1. Select **Save** to save your changes.
1. In the app's registration screen, select the **Certificates & secrets** blade in the left to open the page where we can generate secrets and upload certificates.
1. In the **Client secrets** section, select **New client secret**:
   - Type a key description (for instance `app secret`),
   - Select one of the available key durations (**In 1 year**, **In 2 years**, or **Never Expires**) as per your security posture.
   - The generated key value will be displayed when you select the **Add** button. Copy the generated value for use in the steps later.
   - You'll need this key later in your code's configuration files. This key value will not be displayed again, and is not retrievable by any other means, so make sure to note it from the Azure portal before navigating to any other screen or blade.
1. In the app's registration screen, select the **Expose an API** blade to the left to open the page where you can declare the parameters to expose this app as an API for which client applications can obtain [access tokens](https://docs.microsoft.com/azure/active-directory/develop/access-tokens) for.
The first thing that we need to do is to declare the unique [resource](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow) URI that the clients will be using to obtain access tokens for this Api. To declare an resource URI, follow the following steps:
   - Select `Set` next to the **Application ID URI** to generate a URI that is unique for this app.
   - For this sample, accept the proposed Application ID URI (`api://{clientId}`) by selecting **Save**.
1. All APIs have to publish a minimum of one [scope](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code) for the client's to obtain an access token successfully. To publish a scope, follow the following steps:
   - Select **Add a scope** button open the **Add a scope** screen and Enter the values as indicated below:
        - For **Scope name**, use `access_as_user`.
        - Select **Admins and users** options for **Who can consent?**.
        - For **Admin consent display name** type `Access msal-react-spa`.
        - For **Admin consent description** type `Allows the app to access msal-react-spa as the signed-in user.`
        - For **User consent display name** type `Access msal-react-spa`.
        - For **User consent description** type `Allow the application to access msal-react-spa on your behalf.`
        - Keep **State** as **Enabled**.
        - Select the **Add scope** button on the bottom to save this scope.
1. In the app's registration screen, select the **API permissions** blade in the left to open the page where we add access to the APIs that your application needs.
   - Keep the Graph API User.Read permission, already provided by default.
   - Select the **Add a permission** button and then,
     - Ensure that the **My APIs** tab is selected.
     - In the list of APIs, select the API `msal-react-spa`.
     - In the **Delegated permissions** section, select the **Access 'msal-react-spa'** in the list. Use the search box if necessary.
     - Select the **Add permissions** button at the bottom.
2. In the app's registration screen, select the **Manifest** blade. Then:
   - Find the key `"accessTokenAcceptedVersion"` and replace the existing value with **2** i.e. `"accessTokenAcceptedVersion": 2`.

#### Configure the app (msal-react-spa) to use your app registration

Open the project in your IDE (like Visual Studio or Visual Studio Code) to configure the code.

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `App/src/.env` file.
1. Find the `REACT_APP_AAD_APP_CLIENT_ID` environment variable and add the application ID (clientId) of `msal-react-spa` app copied from the Azure portal.
1. Find the `REACT_APP_AAD_APP_TENANT_ID` environment variable and add your Azure AD tenant ID.
1. Find the `REACT_APP_AAD_APP_REDIRECT_URI` environment variable and add the Redirect URI that you've registered earlier, e.g. `http://localhost:3000` (:warning: remember, you will update this value later on when you deploy your app to App Service)

## Deployment

There are basically **3** stages that you will have to go through in order to deploy your projects and enable authentication:

1. Create a repository on GitHub and commit your project.
1. Create a **Static Web App** via VS Code extensions.
1. Add **environment variables** to your static web app.
1. Update **Azure AD** **App Registration** with deployed website URI that you have just obtained.

### Deploy the app (msal-react-spa)

There are various ways to deploy your applications to **Azure Static Web Apps**. Here we provide steps for deployment via **VS Code Azure Static Web Apps Extension**.

> We recommend reading the [Quickstart: Building your first static site with Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/getting-started?tabs=vanilla-javascript) for gaining familiarity with the process outlined below.

#### Part 1: Deploy the app

1. Locate the project in [4-Deployment/App](./App). Then, [create a GitHub repository](https://docs.github.com/en/github/getting-started-with-github/create-a-repo) and [commit the project there](https://docs.github.com/en/github/importing-your-projects-to-github/adding-an-existing-project-to-github-using-the-command-line).
2. Open the project in **VS Code**, select the **Azure** icon on the left hand side. Sign-in if you haven't already done so.

![Icon](./ReadmeFiles/azure_icon.png)

3. Follow the steps below to create a static web app. Note its URI once it's created.

![Step1](./ReadmeFiles/step1.png)

![Step2](./ReadmeFiles/step2.png)

![Step3](./ReadmeFiles/step3.png)

![Step4](./ReadmeFiles/step4.png)
> choose a region that is appropriate for you.

![Step5](./ReadmeFiles/step5.png)

![Step6](./ReadmeFiles/step6.png)

4. Once your static web app is created, Azure will add a [GitHub action](https://docs.github.com/en/actions/learn-github-actions) to your repository. After that, each new push to your repository will trigger a deployment cycle.

![Step7](./ReadmeFiles/step7.png)
![Step8](./ReadmeFiles/step8.png)

#### Part 2: Update the app's registration

1. Navigate back to the [Azure Portal](https://portal.azure.com).
1. In the left-hand navigation pane, select the **Azure Active Directory** service, and then select **App registrations**.
1. In the resulting screen, select the name of your application.
1. From the *Branding* menu, update the **Home page URL**, to the address of your service, for example [https://reactspa1.z22.web.core.windows.net/](https://reactspa1.z22.web.core.windows.net/). Save the configuration.
1. Add the same URI in the list of values of the *Authentication -> Redirect URIs* menu. If you have multiple redirect URIs, make sure that there a new entry using the App service's URI for each redirect URI.

#### Part 3: Add environment variables to your static web app

1. Navigate back to the [Azure Portal](https://portal.azure.com).
1. Find the application you've created previously under **Azure Static Web Apps** and select it.
1. Select the **Configuration** blade on the left hand side. Add the following **environment variables** there:
    1. `CLIENT_ID`: enter the application ID (clientId) of `msal-react-spa` app copied from the Azure portal.
    1. `TENANT_INFO`: enter your Azure AD tenant ID.
    1. `CLIENT_SECRET`: enter your client secret that you've obtained during app registration.
    1. `EXPECTED_SCOPES`: enter the name of the scope you exposed earlier, e.g. `access_as_user`.

![Step9](./ReadmeFiles/step9.png)

For more information, see [Configure application settings for Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/application-settings#uploading-application-settings)

## Explore the sample

1. Open your browser and navigate to your deployed client app's URI, for instance: `https://reactspa1.z22.web.core.windows.net/`.
1. Select the **Sign In** button on the top right corner. Choose either **Popup** or **Redirect** flow.
1. Select the **Profile** button on the navigation bar. This will make a call to the Microsoft Graph API.
1. Select the **FunctionAPI** button on the navigation bar. This will make a call to your web API which in turn calls the Microsoft Graph. API.

![Screenshot](./ReadmeFiles/screenshot.png)

## We'd love your feedback!

Were we successful in addressing your learning objective? Consider taking a moment to [share your experience with us](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR73pcsbpbxNJuZCMKN0lURpUNDVHTkg2VVhWMTNYUTZEM05YS1hSN01EOSQlQCN0PWcu).

## About the code

For both the SPA and the function API components, we have used a single Azure AD app registration, as these components are tightly coupled and essentially perform as a single app. The function API endpoint is exposed under the `*/api` path, where `*` is the domain of the deployed sample. So for instance, the function API named **HelloUser** is exposed at `*/api/hello`. See the [function.json](./App/api/HelloUser/function.json) file for how to modify the endpoint.

We briefly discuss other important aspects of the sample below.

### Handling React routes

Routing in **Azure Static Web Apps** defines back-end routing rules and authorization behavior for both static content and APIs. The rules are defined as an array of rules in the [routes.json](./APP/public/routes.json) file, located in the **public** folder. In this sample, we are serving the same file, [index.html](./App/public/index.html), for all possible routes using a wildcard character.

```json
{
    "routes": [
        {
            "route": "/*",
            "serve": "/index.html",
            "statusCode": 200
        }
    ],
    "platformErrorOverrides": [
        {
            "errorType": "NotFound",
            "serve": "/index.html"
        },
        {
            "errorType": "Unauthenticated",
            "statusCode": "302",
            "serve": "/"
        }
    ],
    "defaultHeaders": {
        "content-security-policy": "default-src https: 'unsafe-eval' 'unsafe-inline'; object-src 'none'"
    },
    "mimeTypes": {
        "custom": "text/html"
    }
}
```

For more information, visit [Routes in Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/routes)

### Protecting Function API

The function API expects a valid access token to initiate the call to Microsoft Graph using on-behalf-of flow. This is illustrated in [index.js](./App/src/index.js).

```javascript
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const ssoToken = (req.body && req.body.ssoToken);

    try {
        const isAuthorized = await validateAccessToken(ssoToken);

        if (isAuthorized) {
            // call Graph using OBO flow
        } else {
            context.res = {
                status: 401,
                body: {
                    response: "Invalid token"
                }
            };
        }
    } catch (error) {
        context.log(error);

        context.res = {
            status: 500,
            body: {
                response: JSON.stringify(error),
            }
        };
    }
}
```

In React SPA, we call the function API using a POST request as shown below. This is illustrated in [fetch.js](./App/src/fetch.js):

```javascript
export const callOwnApiWithToken = async(accessToken, apiEndpoint) => {
    return fetch(apiEndpoint, {
            method: "POST",
            body: JSON.stringify({
                  ssoToken: accessToken
                })
        }).then(response => response.json())
        .catch(error => console.log(error));
}
```

### Validating access tokens

Before authorizing a user, the access token sent by the user needs to be validated. A minimal token validation can be illustrated as follows, see [index.js](./App/api/HelloUser/index.js):

```javascript
validateAccessToken = async(accessToken) => {
    
    if (!accessToken || accessToken === "" || accessToken === "undefined") {
        console.log('No tokens found');
        return false;
    }

    // we will first decode to get kid parameter in header
    let decodedToken; 
    
    try {
        decodedToken = jwt.decode(accessToken, {complete: true});
    } catch (error) {
        console.log('Token cannot be decoded');
        console.log(error);
        return false;
    }

    // obtains signing keys from discovery endpoint
    let keys;

    try {
        keys = await getSigningKeys(decodedToken.header);        
    } catch (error) {
        console.log('Signing keys cannot be obtained');
        console.log(error);
        return false;
    }

    // verify the signature at header section using keys
    let verifiedToken;

    try {
        verifiedToken = jwt.verify(accessToken, keys);
    } catch(error) {
        console.log('Token cannot be verified');
        console.log(error);
        return false;
    }

    /**
     * Validates the token against issuer, audience, scope
     * and timestamp, though implementation and extent vary. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validating-tokens
     */

    const now = Math.round((new Date()).getTime() / 1000); // in UNIX format

    const checkTimestamp = verifiedToken["iat"] <= now && verifiedToken["exp"] >= now ? true : false;
    const checkAudience = verifiedToken['aud'] === process.env['CLIENT_ID'] || verifiedToken['aud'] === 'api://' + process.env['CLIENT_ID'] ? true : false;
    const checkScope = verifiedToken['scp'] === process.env['EXPECTED_SCOPES'] ? true : false;
    const checkIssuer = verifiedToken['iss'].includes(process.env['TENANT_INFO']) ? true : false;

    if (checkTimestamp && checkAudience && checkScope && checkIssuer) {
        return true;
    }
    return false;
}
```

## More information

For more information about how OAuth 2.0 protocols work in this scenario and other scenarios, see [Authentication Scenarios for Azure AD](https://docs.microsoft.com/azure/active-directory/develop/authentication-flows-app-scenarios).

## Community Help and Support

Use [Stack Overflow](http://stackoverflow.com/questions/tagged/msal) to get support from the community.
Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before.
Make sure that your questions or comments are tagged with [`azure-ad` `azure-ad-b2c` `ms-identity` `msal`].

If you find a bug in the sample, please raise the issue on [GitHub Issues](../../issues).

To provide a recommendation, visit the following [User Voice page](https://feedback.azure.com/forums/169401-azure-active-directory).

## Contributing

If you'd like to contribute to this sample, see [CONTRIBUTING.MD](../../CONTRIBUTING.md).

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
