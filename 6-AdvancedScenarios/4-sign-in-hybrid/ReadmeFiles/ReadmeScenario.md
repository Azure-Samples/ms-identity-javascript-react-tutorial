
This sample demonstrates the hybrid SPA Flow where an Express web application will authenticate the back end using  **MSAL-Node** and generates the Spa Authorization Code for React SPA application. The React SPA will redeem the Spa Authorization Code sent by Express web to authenticate the client-side.


1- The Express web application uses **MSAL-Node** to sign and obtain JWT [access token](https://docs.microsoft.com/azure/active-directory/develop/access-tokens) from **Azure AD** as well as an additional Spa Authorization Code to be passed to a client-side single page application.

2- The Spa Authrization Code is passed to the React SPA to be exchanged for an access token client-side.

3- The access token is used as a *bearer token* to authorize the user to call the **Microsoft Graph API**

4-The **Microsoft Graph API** responds with the resource if user is authorized.
