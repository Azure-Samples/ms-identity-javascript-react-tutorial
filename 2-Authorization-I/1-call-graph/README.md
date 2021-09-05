# React single-page application using MSAL React to sign-in users against Azure Active Directory

 1. [Overview](#overview)
 1. [Scenario](#scenario)
 1. [Contents](#contents)
 1. [Prerequisites](#prerequisites)
 1. [Setup](#setup)
 1. [Registration](#registration)
 1. [Running the sample](#running-the-sample)
 1. [Explore the sample](#explore-the-sample)
 1. [About the code](#about-the-code)
 1. [More information](#more-information)
 1. [Community Help and Support](#community-help-and-support)
 1. [Contributing](#contributing)

## Overview

This sample demonstrates a React single-page application (SPA) calling [Microsoft Graph](https://docs.microsoft.com/graph/overview) using the [Microsoft Authentication Library for React](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react) (MSAL React). In addition, this sample also demonstrates how to user [Microsoft Graph JavaScript SDK](https://github.com/microsoftgraph/msgraph-sdk-javascript) client with MSAL as a custom authentication provider to call the Graph API.

> :information_source: Note that you are not required to implement a custom provider, as the v3.0 (preview) of the SDK offers a [default provider](https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/AuthCodeMSALBrowserAuthenticationProvider.md) that implements MSAL.js.

Here you'll learn how to [sign-in](https://docs.microsoft.com/azure/active-directory/develop/scenario-spa-sign-in), [acquire a token](https://docs.microsoft.com/azure/active-directory/develop/scenario-spa-acquire-token) and [call a protected web API](https://docs.microsoft.com/azure/active-directory/develop/scenario-spa-call-api), as well as [Dynamic Scopes and Incremental Consent](https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent), **working with multiple resources** and **securing your routes** and more.

## Scenario

1. The client React SPA uses **MSAL React** to sign-in a user and obtain a JWT [access token](https://docs.microsoft.com/azure/active-directory/develop/access-tokens) from **Azure AD**.
2. The access token is used as a *bearer token* to authorize the user to call the **Microsoft Graph API**.
3. The **Microsoft Graph API** responds with the resource if user is authorized.

![Overview](./ReadmeFiles/topology.png)

## Contents

| File/folder         | Description                                                                |
|---------------------|----------------------------------------------------------------------------|
| `App.jsx`           | Main application logic resides here.                                       |
| `fetch.jsx`         | Provides a helper method for making fetch calls using bearer token scheme. |
| `graph.jsx`         | Instantiates Graph SDK client using a custom authentication provider.      |
| `authConfig.js`     | Contains authentication configuration parameters.                          |
| `pages/Profile.jsx` | Calls Microsoft Graph `/me` endpoint vith Graph SDK.                       |
| `pages/Mails.jsx`   | Calls Microsoft Graph `/me/messages` endpoint vith Graph SDK.              |
| `pages/Tenants.jsx` | Calls Microsoft Graph `/tenants` endpoint via fetch API.                   |

## Prerequisites

- An **Azure AD** tenant. For more information see: [How to get an Azure AD tenant](https://docs.microsoft.com/azure/active-directory/develop/quickstart-create-new-tenant)
- A user account in your **Azure AD** tenant. This sample will not work with a **personal Microsoft account**. Therefore, if you signed in to the [Azure portal](https://portal.azure.com) with a personal account and have never created a user account in your directory before, you need to do that now.
- An Azure subscription (if you would like to call the [Azure Resource Management API](https://docs.microsoft.com/azure/azure-resource-manager/management/overview))

## Setup

### Step 1: Clone or download this repository

From your shell or command line:

```console
    git clone https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial.git
```

or download and extract the repository .zip file.

> :warning: To avoid path length limitations on Windows, we recommend cloning into a directory near the root of your drive.

### Step 2: Install project dependencies

```console
    cd ms-identity-javascript-react-tutorial
    cd 2-Authorization-I/1-call-graph/SPA
    npm install
```

## Registration

There is one project in this sample. To register it, you can:

- follow the steps below for manually register your apps
- or use PowerShell scripts that:
  - **automatically** creates the Azure AD applications and related objects (passwords, permissions, dependencies) for you.
  - modify the projects' configuration files.

<details>
  <summary>Expand this section if you want to use this automation:</summary>

> :warning: If you have never used **Azure AD Powershell** before, we recommend you go through the [App Creation Scripts](./AppCreationScripts/AppCreationScripts.md) once to ensure that your environment is prepared correctly for this step.

1. On Windows, run PowerShell as **Administrator** and navigate to the root of the cloned directory
1. If you have never used Azure AD Powershell before, we recommend you go through the [App Creation Scripts](./AppCreationScripts/AppCreationScripts.md) once to ensure that your environment is prepared correctly for this step.
1. In PowerShell run:

   ```PowerShell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
   ```

1. Run the script to create your Azure AD application and configure the code of the sample application accordingly.
1. In PowerShell run:

   ```PowerShell
   cd .\AppCreationScripts\
   .\Configure.ps1
   ```

   > Other ways of running the scripts are described in [App Creation Scripts](./AppCreationScripts/AppCreationScripts.md)
   > The scripts also provide a guide to automated application registration, configuration and removal which can help in your CI/CD scenarios.

</details>

### Choose the Azure AD tenant where you want to create your applications

As a first step you'll need to:

1. Sign in to the [Azure portal](https://portal.azure.com).
1. If your account is present in more than one Azure AD tenant, select your profile at the top right corner in the menu on top of the page, and then **switch directory** to change your portal session to the desired Azure AD tenant.

### Register the app (msal-react-spa)

1. Navigate to the [Azure portal](https://portal.azure.com) and select the **Azure AD** service.
1. Select the **App Registrations** blade on the left, then select **New registration**.
1. In the **Register an application page** that appears, enter your application's registration information:
   - In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `msal-react-spa`.
   - Under **Supported account types**, select **Accounts in this organizational directory only**.
   - In the **Redirect URI** section, select **Single-page application** in the combo-box and enter the following redirect URI: `http://localhost:3000/`.
1. Select **Register** to create the application.
1. In the app's registration screen, find and note the **Application (client) ID**. You use this value in your app's configuration file(s) later in your code.
1. Select **Save** to save your changes.
1. In the app's registration screen, select the **API permissions** blade in the left to open the page where we add access to the APIs that your application needs.
   - Select the **Add a permission** button and then,
   - Ensure that the **Microsoft APIs** tab is selected.
   - In the *Commonly used Microsoft APIs* section, select **Microsoft Graph**
   - In the **Delegated permissions** section, select the **User.Read** and **Mail.Read** in the list. Use the search box if necessary.
   - Select the **Add permissions** button at the bottom.
1. Still in the **API permissions** blade,
   - Select the **Add a permission** button and then,
   - Ensure that the **Microsoft APIs** tab is selected.
   - In the *Commonly used Microsoft APIs* section, select **Azure Service Management**
   - In the **Delegated permissions** section, select the **user_impersonation** in the list. Use the search box if necessary.
   - Select the **Add permissions** button at the bottom.

#### Configure the app (msal-react-spa) to use your app registration

Open the project in your IDE (like Visual Studio or Visual Studio Code) to configure the code.

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `App\authConfig.js` file.
1. Find the key `Enter_the_Application_Id_Here` and replace the existing value with the application ID (clientId) of `msal-react-spa` app copied from the Azure portal.
1. Find the key `Enter_the_Tenant_Info_Here` and replace the existing value with your Azure AD tenant name.

## Running the sample

Locate the folder where `package.json` resides in your terminal. Then:

```console
    npm start
```

## Explore the sample

1. Open your browser and navigate to `http://localhost:3000`.
1. Select the **Sign In** button on the top right corner. Choose either **Popup** or **Redirect** flows.
1. Select the **Profile** button on the navigation bar. This will make a call to the Graph API.
1. Select the **Mails** button on the navigation bar. This will make a call to the Graph API (:warning: the user needs to have an Office subscription for this call to work).
1. Select the **Tenant** button on the navigation bar. This will make a call to Azure Resource Management (ARM) API.

![Screenshot](./ReadmeFiles/screenshot.png)

> :information_source: Did the sample not work for you as expected? Then please reach out to us using the [GitHub Issues](../../../issues) page.

## We'd love your feedback!

Were we successful in addressing your learning objective? Consider taking a moment to [share your experience with us](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR73pcsbpbxNJuZCMKN0lURpUMlRHSkc5U1NLUkxFNEtVN0dEOTFNQkdTWiQlQCN0PWcu).

## About the code

### Protected resources and scopes

In order to access a protected resource on behalf of a signed-in user, the app needs to present a valid **Access Token** to that resource owner (in this case, Microsoft Graph). **Access Token** requests in **MSAL** are meant to be *per-resource-per-scope(s)*. This means that an **Access Token** requested for resource **A** with scope `scp1`:

- cannot be used for accessing resource **A** with scope `scp2`, and,
- cannot be used for accessing resource **B** of any scope.

The intended recipient of an **Access Token** is represented by the `aud` claim (in this case, it should be the Microsoft Graph API's App ID); in case the value for the `aud` claim does not mach the resource **APP ID URI**, the token should be considered invalid. Likewise, the permissions that an **Access Token** grants is represented by the `scp` claim. See [Access Token claims](https://docs.microsoft.com/azure/active-directory/develop/access-tokens#payload-claims) for more information.

### Working with multiple resources

When you have to access multiple resources, initiate a separate token request for each:

 ```javascript
     // "User.Read" stands as shorthand for "graph.microsoft.com/User.Read"
     const graphToken = await msalInstance.acquireTokenSilent({
          scopes: [ "User.Read" ]
     });
     const customApiToken = await msalInstance.acquireTokenSilent({
          scopes: [ "api://<myCustomApiClientId>/My.Scope" ]
     });
 ```

Bear in mind that you *can* request multiple scopes for the same resource (e.g. `User.Read`, `User.Write` and `Calendar.Read` for **MS Graph API**).

 ```javascript
     const graphToken = await msalInstance.acquireTokenSilent({
          scopes: [ "User.Read", "User.Write", "Calendar.Read"] // all MS Graph API scopes
     });
 ```

In case you *erroneously* pass multiple resources in your token request, the token you will receive will only be issued for the first resource.

 ```javascript
     // you will only receive a token for MS GRAPH API's "User.Read" scope here
     const myToken = await msalInstance.acquireTokenSilent({
          scopes: [ "User.Read", "api://<myCustomApiClientId>/My.Scope" ]
     });
 ```

### Dynamic scopes and incremental consent

In **Azure AD**, the scopes (permissions) set directly on the application registration are called static scopes. Other scopes that are only defined within the code are called dynamic scopes. This has implications on the **login** (i.e. loginPopup, loginRedirect) and **acquireToken** (i.e. `acquireTokenPopup`, `acquireTokenRedirect`, `acquireTokenSilent`) methods of **MSAL.js**. Consider:

```javascript
     const loginRequest = {
          scopes: [ "openid", "profile", "User.Read" ]
     };

     const tokenRequest = {
          scopes: [ "Mail.Read" ]
     };

     // will return an ID Token and an Access Token with scopes: "openid", "profile" and "User.Read"
     msalInstance.loginPopup(loginRequest);

     // will fail and fallback to an interactive method prompting a consent screen
     // after consent, the received token will be issued for "openid", "profile" ,"User.Read" and "Mail.Read" combined
     msalInstance.acquireTokenPopup(tokenRequest);
```

In the code snippet above, the user will be prompted for consent once they authenticate and receive an **ID Token** and an **Access Token** with scope `User.Read`. Later, if they request an **Access Token** for `User.Read`, they will not be asked for consent again (in other words, they can acquire a token *silently*). On the other hand, the user did not consented to `Mail.Read` at the authentication stage. As such, they will be asked for consent when requesting an **Access Token** for that scope. The token received will contain all the previously consented scopes, hence the term *incremental consent*.

### Acquire a Token

**MSAL.js** exposes 3 APIs for acquiring a token: `acquireTokenPopup()`, `acquireTokenRedirect()` and `acquireTokenSilent()`. The `acquireTokenSilent()` API is meant to retrieve a non-expired access token from cache *silently*.

```javascript
export function App() {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0]);
    const [apiData, setApiData] = useState(null);

    useEffect(() => {
        if (account) {
            instance.acquireTokenSilent({
                scopes: ["User.Read"],
                account: account
            }).then((response) => {
                if(response) {
                    callMsGraph(response.accessToken).then((result) => setApiData(result));
                }
            });
        }
    }, [account, instance]);

    if (accounts.length > 0) {
        return (
            <>
                <span>There are currently {accounts.length} users signed in!</span>
                {apiData && (<span>Data retrieved from API: {JSON.stringify(apiData)}</span>)}
            </>
        );
    } else if (inProgress === "login") {
        return <span>Login is currently in progress!</span>
    } else {
        return <span>There are currently no users signed in!</span>
    }
}
```

If `acquireTokenSilent()` fails, the recommended pattern is to fallback to one of the interactive methods i.e. `acquireTokenPopup()` or `acquireTokenRedirect()`. In the sample, each of these options are illustrated:

- [Profile.jsx](./SPA/src/pages/Profile.jsx) uses `acquireTokenSilent` and falls back to `acquireTokenPopup` if interaction is required
- [Tenant.jsx](./SPA/src/pages/Tenant.jsx) uses `acquireTokenSilent` and falls back to `acquireTokenRedirect` if interaction is required
- [Mails.jsx](./SPA/src/pages/Mails.jsx) uses `acquireTokenRedirect` only.

> :information_source: When using `acquireTokenRedirect`, you may want to set `navigateToLoginRequestUrl` in [msalConfig](./SPA/src/authConfig.js) to **true** if you wish to return back to the page where acquireTokenRedirect was called.

### Access Token validation

Clients should treat access tokens as opaque strings, as the contents of the token are intended for the **resource only** (such as a web API or Microsoft Graph). For validation and debugging purposes, developers can decode **JWT**s (*JSON Web Tokens*) using a site like [jwt.ms](https://jwt.ms).

### Calling the Microsoft Graph API

[Microsoft Graph JavaScript SDK](https://github.com/microsoftgraph/msgraph-sdk-javascript) provides various utility methods to query the Graph API. While the SDK has a default authentication provider that can be used in basic scenarios, it can also be extended to use with a custom authentication provider such as MSAL. To do so, we will initialize the Graph SDK client with [clientOptions](https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/CreatingClientInstance.md) method, which contains an `authProvider` object of class **MyAuthenticationProvider** that handles the token acquisition process for the client.

```javascript
export const getGraphClient = () => {
    let clientOptions = {
        authProvider: new MyAuthenticationProvider(),
    };

    const graphClient = Client.initWithMiddleware(clientOptions);

    return graphClient;
}
```

**MyAuthenticationProvider** needs to implement the [IAuthenticationProvider](https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/src/IAuthenticationProvider.ts) interface, which can be done as shown below:

```javascript
import { InteractionRequiredAuthError, InteractionType } from "@azure/msal-browser";
import { Client } from '@microsoft/microsoft-graph-client';
import { msalInstance } from "./index";

class MyAuthenticationProvider {

    /**
     * This method will get called before every request to the ms graph server
     * This should return a Promise that resolves to an accessToken (in case of success) or rejects with error (in case of failure)
     * Basically this method will contain the implementation for getting and refreshing accessTokens
     */
    getAccessToken() {
        return new Promise(async (resolve, reject) => {
            const account = msalInstance.getActiveAccount();
            let response;

            if (!account) {
                throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
            }

            response = await msalInstance.acquireTokenSilent({
                account: account,
                scopes: scopes
            });

            if (response.accessToken) {
                resolve(response.accessToken);
            } else {
                reject(Error('Failed to acquire an access token'));
            }
        });
    }
}
```

See [graph.js](./SPA/src/graph.js). The Graph client then can be used in your components as shown below:

```javascript
const ProfileContent = () => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none" && !graphData) {
            getGraphClient(instance.getActiveAccount(), protectedResources.graphMe.scopes, InteractionType.Popup)
                .api("/me").get()
                    .then((response) => setGraphData(response))
                    .catch((error) => console.log(error));
        }
    }, [account, inProgress, instance]);

    return (
        <>
            { graphData ? <ProfileData graphData={graphData} /> : null}
        </>
    );
};
```

### Calling a protected web API

Using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), simply add the `Authorization` header to your request, followed by the **access token** you have obtained previously for this resource/endpoint (as a [bearer token](https://tools.ietf.org/html/rfc6750)):

```javascript
export const callApiWithToken = async(accessToken, apiEndpoint) => {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(apiEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}
```

See [fetch.js](./SPA/src/fetch.js).

### Working with React routes

You can use [React Router](https://reactrouter.com/) component in conjunction with **MSAL React**. Simply wrap the `MsalProvider` component between the `Router` component, passing the `PublicClientApplication` instance you have created earlier as props:

```javascript
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <App pca={msalInstance} />
  </React.StrictMode>,
  document.getElementById('root')
);

const App = ({pca}) => {
  return (
    <Router>
      <MsalProvider instance={pca}>
          <PageLayout>
            <Pages />
          </PageLayout>
      </MsalProvider>
    </Router>
  );
}

const Pages = () => {
  return (
    <Switch>
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  )
}
```

### Securing your React routes

You can ensure that your users are authenticated when visiting a certain route/page with the help of `MsalAuthenticationTemplate` component. This component takes a number of props to manage the sign-in experience when an unauthenticated user hits the route:

```javascript
export const Profile = () => {
    const authRequest = {
        ...loginRequest
    };

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Popup} 
            authenticationRequest={authRequest} 
            errorComponent={ErrorComponent} 
            loadingComponent={Loading}
        >
            <ProfileContent />
        </MsalAuthenticationTemplate>
      )
};
```

## More information

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

For more information about how OAuth 2.0 protocols work in this scenario and other scenarios, see [Authentication Scenarios for Azure AD](https://docs.microsoft.com/azure/active-directory/develop/authentication-flows-app-scenarios).

## Community Help and Support

Use [Stack Overflow](http://stackoverflow.com/questions/tagged/msal) to get support from the community.
Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before.
Make sure that your questions or comments are tagged with [`azure-active-directory` `react` `ms-identity` `adal` `msal`].

If you find a bug in the sample, raise the issue on [GitHub Issues](../../../../issues).

To provide feedback on or suggest features for Azure Active Directory, visit [User Voice page](https://feedback.azure.com/forums/169401-azure-active-directory).

## Contributing

If you'd like to contribute to this sample, see [CONTRIBUTING.MD](/CONTRIBUTING.md).

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.