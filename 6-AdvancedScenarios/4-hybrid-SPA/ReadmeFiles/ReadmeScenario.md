
This sample uses **MSAL React**  a React SPA and an Express web application hybrid sample that calls the Microsoft Graph API.

1-The Express web application uses **MSAL-Node** to sign and obtain JWT [access token](https://docs.microsoft.com/azure/active-directory/develop/access-tokens) from **Azure AD** as well as an addinal Spa Authrization Code to be passed to a client-side single page application.

2-The Spa Authrization Code is passed to the React SPA to be exchanged for an access token client side.

3-  The access token is used as a *bearer token* to authorize the user to call the **Microsoft Graph API**

4-The **Microsoft Graph API** responds with the resource if user is authorized.
