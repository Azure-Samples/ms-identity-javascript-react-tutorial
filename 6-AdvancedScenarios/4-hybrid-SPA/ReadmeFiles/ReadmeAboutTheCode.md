
### Confidential client 

In this sample, the user is first authenticated using an MSAL Node confidential client.

```javascript
const msal = require('@azure/msal-node');
const appSettings = require('./appSettings.js');

const msalInstance = new msal.ConfidentialClientApplication({
    auth: {
        clientId: appSettings.appCredentials.clientId,
        authority: `https://login.microsoftonline.com/${appSettings.appCredentials.tenantId}`,
        clientSecret: appSettings.appCredentials.clientSecret
    },
    system: {
        loggerOptions: {
            loggerCallback: (loglevel, message, containsPii) => {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }
    }
});

```

Next, generate an auth code url and navigate the user:

```javascript
const authCodeUrlParameters = {
        redirectUri: appSettings.appCredentials.redirectUri,
        responseMode: "form_post",
    };

    msalInstance.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.json(response);
        }).catch((error) => console.log(error))
```

Next, parse the authorization code, and invoke the acquireTokenByCode API on the ConfidentialClientApplication instance.

When invoking this API, set enableSpaAuthorizationCode to true, which will enable MSAL to acquire a second authorization code to be redeemed by your single-page application.

```javascript

    const tokenRequest = {
            code: req.body.code,
            redirectUri: appSettings.appCredentials.redirectUri,
            enableSpaAuthorizationCode: appSettings.appCredentials.enableSpaAuthorizationCode
        };

    msalInstance.acquireTokenByCode(tokenRequest)
        .then((response) => {

            const { code } = response;
            req.session.code = code;
            const urlFrom = (urlObject) => String(Object.assign(new URL("http://localhost:5000"), urlObject))
            res.redirect(urlFrom({
                 protocol: 'http',
                 pathname: '/',
                 search: 'getCode=true'
            }))
        }).catch((err) => {
            console.log(err)
        })
```


### Public client

First, configure a new PublicClientApplication from MSAL.js in your single-page application:

```javascript
export const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <BrowserRouter>
    <App instance={msalInstance}/>
  </BrowserRouter>,
  document.getElementById('root')
);
```

Next, render the code that was acquired server-side, and provide it to the acquireTokenByCode API on the MSAL.js PublicClientApplication instance.

```javascript
seEffect(() => {
  if(getCode){
    callApiToGetSpaCode()
      .then((data) => {      
        if(inProgress === "none"){
          // SPA auth code
          let code = data.code;
          instance.acquireTokenByCode({code})
            .then((res) => {
              setdata(res)
            }).catch((error) => {
              if(error instanceof InteractionRequiredAuthError){
                 if (inProgress === "none") {
                   instance.acquireTokenPopup({code})
                      .then((res) => {
                        setdata(res)
                      }).catch((error) => {
                        console.log(error)
                      })
                 }
              }
          })
        }
      })
    }
  });
```
