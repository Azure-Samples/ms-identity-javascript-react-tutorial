# React single-page application using MSAL React to sign-in users against Azure AD B2C

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

This sample demonstrates a React SPA that authenticates users against Azure AD B2C.

## Scenario

1. The client React SPA uses the Microsoft Authentication Library (MSAL) to obtain an ID Token from **Azure AD B2C**.
2. The **ID Token** proves that the user has successfully authenticated against **Azure AD B2C**.

![Overview](./ReadmeFiles/topology.png)

## Contents

| File/folder         | Description                                      |
|---------------------|--------------------------------------------------|
| `App/authConfig.js` | Contains authentication parameters.              |
| `App/App.jsx`       | Main application logic resides here.             |
| `App/ui.jsx`        | UI update logic resides here.                    |

## Prerequisites

- An **Azure AD B2C** tenant. For more information see: [How to get an Azure AD B2C tenant](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-create-tenant)
- A user account in your **Azure AD B2C** tenant.

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
    cd 1-Authentication/2-sign-in-b2c
    npm install
```

### Register the sample application(s) with your Azure Active Directory tenant

:warning: This sample comes with a pre-registered application for demo purposes. If you would like to use your own **Azure AD B2C** tenant and application, follow the steps below to register and configure the application on **Azure portal**. Otherwise, continue with the steps for [Running the sample](#running-the-sample).

### Choose the Azure AD tenant where you want to create your applications

As a first step you'll need to:

1. Sign in to the [Azure portal](https://portal.azure.com).
1. If your account is present in more than one Azure AD B2C tenant, select your profile at the top right corner in the menu on top of the page, and then **switch directory** to change your portal session to the desired Azure AD B2C tenant.

### Create User Flows and Custom Policies

Please refer to: [Tutorial: Create user flows in Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-create-user-flows)

### Add External Identity Providers

Please refer to: [Tutorial: Add identity providers to your applications in Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/tutorial-add-identity-providers)

### Register the spa app (msal-react-spa)

1. Navigate to the [Azure portal](https://portal.azure.com) and select the **Azure AD B2C** service.
1. Select the **App Registrations** blade on the left, then select **New registration**.
1. In the **Register an application page** that appears, enter your application's registration information:
   - In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `msal-react-spa`.
   - Under **Supported account types**, select **Accounts in any identity provider or organizational directory (for authenticating users with user flows)**.
   - In the **Redirect URI** section, select **Single-page application** in the combo-box and enter the following redirect URI: `http://localhost:3000`.
1. Select **Register** to create the application.
1. In the app's registration screen, find and note the **Application (client) ID**. You use this value in your app's configuration file(s) later in your code.
1. Select **Save** to save your changes.

#### Configure the spa app (msal-react-spa) to use your app registration

Open the project in your IDE (like Visual Studio or Visual Studio Code) to configure the code.

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `App\src\authConfig.js` file.
1. Find the key `Enter_the_Application_Id_Here` and replace the existing value with the application ID (clientId) of `msal-react-spa` app copied from the Azure portal.
1. Find the key `Enter_the_Tenant_Info_Here` and replace the existing value with your Azure AD tenant name.

<!-- ENTER CONFIGURATION STEPS FOR B2C USER-FLOWS/CUSTOM POLICIES BELOW -->

## Running the sample

Locate the folder where `package.json` resides in your terminal. Then:

```console
    npm start
```

## Explore the sample

1. Open your browser and navigate to `http://localhost:3000`.
1. Select the **Sign In** button on the top right corner. Choose either **Popup** or **Redirect** flows.
    1. During the sign-in screen, you may select **forgot my password**. This initiates the Azure AD B2C password reset user-flow.
1. Select the **Edit Profile** button on the top right corner. This initiates the Azure AD B2C edit profile user-flow using a popup window (hint: alternatively, you may use redirect flow here instead).
1. Select the **View ID Token Claims** button at the center. This will display some of the important claims in your ID token.

![Screenshot](./ReadmeFiles/screenshot.png)

> :information_source: Did the sample not work for you as expected? Then please reach out to us using the [GitHub Issues](../../../issues) page.

> :information_source: if you believe your issue is with the B2C service itself rather than with the sample, please file a support ticket with the B2C team by following the instructions [here](https://docs.microsoft.com/azure/active-directory-b2c/support-options).

## We'd love your feedback!

Were we successful in addressing your learning objective? Consider taking a moment to [share your experience with us](Enter_Survey_Form_Link).

## About the code

### Configuration

You can initialize your application in several ways, for instance, by loading the configuration parameters from another server. See [Configuration Options](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/configuration.md) for more information.

### Securing Routes

You can add authentication to secure specific routes in your application by just adding `canActivate: [MsalGuard]` to your route definition. It can be added at the parent or child routes.

```javascript
    const routes: Routes = [
        {
            path: 'admin',
            component: AdminComponent,
            canActivate: [MsalGuard]
        }
    ]
```

### Broadcast Events

**MSAL-Angular** wrapper provides below callbacks for various operations. For all callbacks, you need to inject `BroadcastService` as a dependency in your component/service:

```typescript
    this.broadcastService.subscribe("msal:loginSuccess", (payload) => {
        // do something here
    });

    this.broadcastService.subscribe("msal:loginFailure", (payload) => {
        // do something here
    });

    this.broadcastService.subscribe("msal:ssoSuccess", (payload) => {
        // do something here
    });

    this.broadcastService.subscribe("msal:ssoFailure", (payload) => {
        // do something here
    });
```

It is important to unsubscribe. Implement `ngOnDestroy()` in your component and unsubscribe.

```typescript
    private subscription: Subscription;

    this.subscription = this.broadcastService.subscribe("msal:acquireTokenFailure", (payload) => {});

    ngOnDestroy() {
        this.broadcastService.getMSALSubject().next(1);
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
```

### Sign-in

**MSAL-Angular** wrapper exposes 3 login APIs: `loginPopup()`, `loginRedirect()` and `ssoSilent()`:

```typescript
    this.authService.loginPopup();

    this.broadcastService.subscribe("msal:loginSuccess", payload => {
        // do something here
    });

    this.broadcastService.subscribe("msal:loginFailure", payload => {
        // do something here
    });
```

To use the redirect flow, you must register a handler for the redirect callback. **MSAL-Angular** provides the`handleRedirectCallback()` API:

```typescript
    this.authService.handleRedirectCallback((authError, response) => {
        // do something here
    });

    this.authService.loginRedirect();

    this.broadcastService.subscribe("msal:loginSuccess", payload => {
        // do something here
    });

    this.broadcastService.subscribe("msal:loginFailure", payload => {
        // do something here
    });
```

The recommended pattern is that you fallback to an **interactive method** should silent SSO fails:

```typescript

    const silentRequest = {
        loginHint: "example@domain.net"
    };

    this.authService.ssoSilent(silentRequest);

    this.broadcastService.subscribe("msal:ssoSuccess", payload => {
        // do something here
    });

    this.broadcastService.subscribe("msal:ssoFailure", payload => {
        if (InteractionRequiredAuthError.isInteractionRequiredError(payload.error.errorCode)) {
            this.authService.loginRedirect(loginRequest);
        }
    });

```

You can pass custom query string parameters to your sign-in request, using the `extraQueryParameters` property. For instance, in order to customize your B2C user interface, you can:

```typescript
function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: !isIE,
    consentScopes: ["openid", "profile"],
    extraQueryParameters: { campaignId: 'hawaii', ui_locales: 'es' },
  };
}
```

See here for more: [Customize the user interface of your application in Azure AD B2C](https://docs.microsoft.com/azure/active-directory-b2c/custom-policy-ui-customization)

You can get the current signed-in user's account with `getAccount()` API:

```typescript
    this.authService.getAccount();
```

### Sign-out

The application redirects the user to the **Microsoft identity platform** logout endpoint to sign out. This endpoint clears the user's session from the browser. If your app did not go to the logout endpoint, the user may re-authenticate to your app without entering their credentials again, because they would have a valid single sign-in session with the **Microsoft identity platform** endpoint. See for more: [Send a sign-out request](https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request).

The sign-out clears the user's single sign-on session with **Azure AD B2C**, but it might not sign the user out of their **social identity provider** session. If the user selects the same identity provider during a subsequent sign-in, they might re-authenticate without entering their credentials. Here the assumption is that, if a user wants to sign out of the application, it doesn't necessarily mean they want to sign out of their social account (e.g. Facebook) itself.

### ID Token Validation

A single-page application does not benefit from validating ID tokens, since the application runs without a back-end and as such, attackers can intercept and edit the keys used for validation of the token.

### Integrating user-flows

- **Sign-up/sign-in**

This user-flow allows your users to sign-in to your application if the user has an account already, or sign-up for an account if not. This is the default user-flow that we pass during the initialization of MSAL instance.

- **Password reset**

When a user clicks on the **forgot your password?** link during sign-in, **Azure AD B2C** will throw an error. To initiate the password reset user-flow, you need to catch this error and handle it by sending another login request with the corresponding password reset authority string.

```typescript
    this.broadcastService.subscribe("msal:loginFailure", (payload) => {
        if (payload.errorMessage.indexOf('AADB2C90118') > -1) {
          if (isIE) {
            this.authService.loginRedirect(config.policies.authorities.forgotPassword);
          } else {
            this.authService.loginPopup(config.policies.authorities.forgotPassword);
          }
        }
    });
```

We need to reject ID tokens that were not issued with the default sign-in policy. After the user resets her password and signs-in again, we will force a logout and prompt for login again (with the default sign-in policy).

```typescript
    this.broadcastService.subscribe('msal:loginSuccess', (payload) => {
        if (payload.idToken.claims['acr'] === config.policies.names.forgotPassword) {
          window.alert("Password has been reset successfully. \nPlease sign-in with your new password");
          return this.authService.logout();
        }
      });
```

- **Edit Profile**

Unlike password reset, edit profile user-flow does not require users to sign-out and sign-in again. Instead, **MSAL-Angular** will handle
switching back to the authority string of the default user-flow automatically.

```typescript
    editProfile() {
        if (isIE) {
            this.authService.loginRedirect(config.policies.authorities.editProfile);
        } else {
            this.authService.loginPopup(config.policies.authorities.editProfile);
        }
    }
```

## More information

- [What is Azure Active Directory B2C?](https://docs.microsoft.com/azure/active-directory-b2c/overview)
- [Application types that can be used in Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/application-types)
- [Recommendations and best practices for Azure Active Directory B2C](https://docs.microsoft.com/azure/active-directory-b2c/best-practices)
- [Azure AD B2C session](https://docs.microsoft.com/azure/active-directory-b2c/session-overview)
- [Initialize client applications using MSAL.js](https://docs.microsoft.com/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Single sign-on with MSAL.js](https://docs.microsoft.com/azure/active-directory/develop/msal-js-sso)
- [Handle MSAL.js exceptions and errors](https://docs.microsoft.com/azure/active-directory/develop/msal-handling-exceptions?tabs=javascript)
- [Logging in MSAL.js applications](https://docs.microsoft.com/azure/active-directory/develop/msal-logging?tabs=javascript)
- [Pass custom state in authentication requests using MSAL.js](https://docs.microsoft.com/azure/active-directory/develop/msal-js-pass-custom-state-authentication-request)
- [Prompt behavior in MSAL.js interactive requests](https://docs.microsoft.com/azure/active-directory/develop/msal-js-prompt-behavior)
- [Use MSAL.js to work with Azure AD B2C](https://docs.microsoft.com/azure/active-directory/develop/msal-b2c-overview)

For more information about how OAuth 2.0 protocols work in this scenario and other scenarios, see [Authentication Scenarios for Azure AD](https://docs.microsoft.com/azure/active-directory/develop/authentication-flows-app-scenarios).

## Community Help and Support

Use [Stack Overflow](http://stackoverflow.com/questions/tagged/msal) to get support from the community.
Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before.
Make sure that your questions or comments are tagged with [`azure-active-directory` `azure-ad-b2c` `ms-identity` `adal` `msal`].

If you find a bug in the sample, raise the issue on [GitHub Issues](../../../issues).

To provide feedback on or suggest features for Azure Active Directory, visit [User Voice page](https://feedback.azure.com/forums/169401-azure-active-directory).

## Contributing

If you'd like to contribute to this sample, see [CONTRIBUTING.MD](/CONTRIBUTING.md).

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.