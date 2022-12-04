
### Step 1: Clone or download this repository

From your shell or command line:

```console
    git clone https://github.com/Azure-Samples/when pushed.git
```

or download and extract the repository .zip file.

> :warning: To avoid path length limitations on Windows, we recommend cloning into a directory near the root of your drive.

### Step 2: Install project dependencies

- Setup the service app:

```console
    cd 6-AdvancedScenarios\4-hybrid-SPA
    npm install
```

- Setup the client app:

  ```console
    cd cd 6-AdvancedScenarios\4-hybrid-SPA\client
    npm install
    ```


### Step 3: Application Registration

There is one project in this sample. To register it, you can:

- follow the steps below for manually register your apps
- or use PowerShell scripts that:
  - **automatically** creates the Azure AD applications and related objects (passwords, permissions, dependencies) for you.
  - modify the projects' configuration files.

  <details>
   <summary>Expand this section if you want to use this automation:</summary>

> **WARNING**: If you have never used **Azure AD Powershell** before, we recommend you go through the [App Creation Scripts guide](./AppCreationScripts/AppCreationScripts.md) once to ensure that your environment is prepared correctly for this step.

1. On Windows, run PowerShell as **Administrator** and navigate to the root of the cloned directory

1. In PowerShell run:

 ```PowerShell
 Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
 ```

1. Run the script to create your Azure AD application and configure the code of the sample application accordingly.
1. For interactive process - in PowerShell run:

 ```PowerShell
 cd .\AppCreationScripts\
 .\Configure.ps1 -TenantId "[Optional] - your tenant id" -Environment "[Optional] - Azure environment, defaults to 'Global'"
 ```

 > Other ways of running the scripts are described in [App Creation Scripts guide](./AppCreationScripts/AppCreationScripts.md)
 > The scripts also provide a guide to automated application registration, configuration and removal which can help in your CI/CD scenarios.

 </details>

### Choose the Azure AD tenant where you want to create your applications

1. Sign in to the [Azure portal](https://portal.azure.com).
1. If your account is present in more than one Azure AD tenant, select your profile at the top right corner in the menu on top of the page, and then **switch directory** to change your portal session to the desired Azure AD tenant.

### Register the service app (msal-hybrid-spa)

1. Navigate to the [Azure portal](https://portal.azure.com) and select the **Azure AD** service.
1. Select the **App Registrations** blade on the left, then select **New registration**.
1. In the **Register an application page** that appears, enter your application's registration information:
   - In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `msal-hybrid-spa`.
   - Under **Supported account types**, select **Accounts in this organizational directory only**.
   - In the **Redirect URI (optional)** section, select **Web** in the combo-box and enter the following redirect URI: `http://localhost:5000/server-redirect`.
1. Select **Register** to create the application.
1. In the app's registration screen, find and note the **Application (client) ID**. You use this value in your app's configuration file(s) later in your code.
1. Select **Save** to save your changes.
1. In the app's registration screen, select the **Certificates & secrets** blade in the left to open the page where you can generate secrets and upload certificates.
1. In the **Client secrets** section, select **New client secret**:
   - Type a key description (for instance `app secret`),
   - Select one of the available key durations (**6 months**, **12 months** or **Custom**) as per your security posture.
   - The generated key value will be displayed when you select the **Add** button. Copy and save the generated value for use in later steps.
   - You'll need this key later in your code's configuration files. This key value will not be displayed again, and is not retrievable by any other means, so make sure to note it from the Azure portal before navigating to any other screen or blade.
1. In the app's registration screen, select the **API permissions** blade in the left to open the page where we add access to the APIs that your application needs.
      - Select the **Add a permission** button and then:

      - Ensure that the **Microsoft APIs** tab is selected.
      - In the *Commonly used Microsoft APIs* section, select **Microsoft Graph**
      - In the **Delegated permissions** section, select the **User.Read** in the list. Use the search box if necessary.
      - Select the **Add permissions** button at the bottom.
      - Select the **Add a permission** button and then:

      - Ensure that the **My APIs** tab is selected.
      - In the list of APIs, select the API `msal-hybrid-spa`.
      - In the **Delegated permissions** section, select the **Access 'msal-hybrid-spa'** in the list. Use the search box if necessary.
      - Select the **Add permissions** button at the bottom.
1. In the app's registration screen, select the **Expose an API** blade to the left to open the page where you can declare the parameters to expose this app as an API for which client applications can obtain [access tokens](https://aka.ms/access-tokens) for.
The first thing that we need to do is to declare the unique [resource](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow) URI that the clients will be using to obtain access tokens for this API. To declare an resource URI (Application ID URI), follow the following steps:
   - Select `Set` next to the **Application ID URI** to generate a URI that is unique for this app.
   - For this sample, accept the proposed Application ID URI (`api://{clientId}`) by selecting **Save**. Read more about Application ID URI at [Validation differences by supported account types \(signInAudience\)](https://docs.microsoft.com/azure/active-directory/develop/supported-accounts-validation).
1. All APIs have to publish a minimum of one [scope](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code), also called [Delegated Permissions](https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#permission-types), for the client's to obtain an access token successfully. To publish a scope, follow these steps:
   - Select **Add a scope** button open the **Add a scope** screen and Enter the values as indicated below:
        - For **Scope name**, use `access_as_user`.
        - Select **Admins and users** options for **Who can consent?**.
        - For **Admin consent display name** type `Allow the app msal-hybrid-spa to [ex, read ToDo list items] as the signed-in user`.
        - For **Admin consent description** type `Allow the application to [ex, read ToDo list items] as the signed-in user.`
        - For **User consent display name** type `[ex, Read ToDo list items] as yourself`.
        - For **User consent description** type `Allow the application to [ex, Read ToDo list items] as the signed-in user on your behalf.`
        - Keep **State** as **Enabled**.
        - Select the **Add scope** button on the bottom to save this scope.
   - Select **Add a scope** button open the **Add a scope** screen and Enter the values as indicated below:
        - For **Scope name**, use `Read.Data`.
        - Select **Admins and users** options for **Who can consent?**.
        - For **Admin consent display name** type `Allow the app msal-hybrid-spa to [ex, read ToDo list items] as the signed-in user`.
        - For **Admin consent description** type `Allow the application to [ex, read ToDo list items] as the signed-in user.`
        - For **User consent display name** type `[ex, Read ToDo list items] as yourself`.
        - For **User consent description** type `Allow the application to [ex, Read ToDo list items] as the signed-in user on your behalf.`
        - Keep **State** as **Enabled**.
        - Select the **Add scope** button on the bottom to save this scope.
   - Select **Add a scope** button open the **Add a scope** screen and Enter the values as indicated below:
        - For **Scope name**, use `Write.Data`.
        - Select **Admins and users** options for **Who can consent?**.
        - For **Admin consent display name** type `Allow the app msal-hybrid-spa to [ex, read ToDo list items] as the signed-in user`.
        - For **Admin consent description** type `Allow the application to [ex, read ToDo list items] as the signed-in user.`
        - For **User consent display name** type `[ex, Read ToDo list items] as yourself`.
        - For **User consent description** type `Allow the application to [ex, Read ToDo list items] as the signed-in user on your behalf.`
        - Keep **State** as **Enabled**.
        - Select the **Add scope** button on the bottom to save this scope.
1. Select the `Manifest` blade on the left.
   - Set `accessTokenAcceptedVersion` property to **2**.
   - Click on **Save**.

#### Configure the service app (msal-hybrid-spa) to use your app registration

Open the project in your IDE (like Visual Studio or Visual Studio Code) to configure the code.

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `.env` file.
1. Find the key `Enter_the_Application_Id_Here` and replace the existing value with the application ID (clientId) of `msal-hybrid-spa` app copied from the Azure portal.
1. Find the key `Enter_the_Tenant_Info_Here` and replace the existing value with your Azure AD tenant ID.
1. Find the key `Enter_the_Client_Secret_Here` and replace the existing value with the key you saved during the creation of `msal-hybrid-spa` copied from the Azure portal.
1. Find the key `Redirect_URI` and replace the existing value with the Redirect URI for `msal-hybrid-spa`. (by default `http://localhost:5000`).

### Step 4: Running the sample

For command line run the next commands:

- Build client

   ```console
    cd Hybrid-SPA/client
    npm run build
    ```

- Run the service app:
  ```console
    cd Hybrid-SPA
    npm start
    ```
