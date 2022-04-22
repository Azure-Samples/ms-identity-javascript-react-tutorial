
### Confidential client 

In this sample, the user is first authenticated using an MSAL Node confidential client.

```javascript
  const msal = require('@azure/msal-node');
  require('dotenv').config();

  const msalInstance = new msal.ConfidentialClientApplication({
      auth: {
          clientId: process.env.CLIENT_ID,
          authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
          clientSecret: process.env.CLIENT_SECRET
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
        redirectUri: process.env.REDIRECT_URI,
        responseMode: "form_post",
    };

    msalInstance.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.json(response);
        }).catch((error) => console.log(error))
```

Next, parse the authorization code, and invoke the acquireTokenByCode API on the ConfidentialClientApplication instance.

When invoking this API, set enableSpaAuthorizationCode to true, which will enable MSAL to acquire a second authorization code to be redeemed by your single-page application.

Your application should parse this second authorization code, as well as any account hints (e.g. sid, login_hint, preferred_username) and return them such that they can be rendered client-side:

```javascript

     const tokenRequest = {
            code: req.body.code,
            redirectUri: process.env.REDIRECT_URI,
            enableSpaAuthorizationCode: true
        };


    
    msalInstance.acquireTokenByCode(tokenRequest)
        .then((response) => {

            const { code } = response; //SPA authorization code
            const {
                sid, // Session ID claim, used for non-hybrid
                login_hint: loginHint, // New login_hint claim (used instead of sid or email)
                preferred_username: preferredUsername // Email
            } = response.idTokenClaims;


            req.session.code = code;
            req.session.loginHint = loginHint;
            req.session.sid = sid;
            req.session.referredUsername = preferredUsername;
            req.session.authenticated = true;

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

The application should also render any account hints, as they will be needed for any interactive requests to ensure the same user is used for both requests.

```javascript
if(getCode && !data){
      callApiToGetSpaCode()
        .then((response) => {
        if(inProgress === "none"){
          const { code, loginHint, sid, referredUsername } = response;
          instance.acquireTokenByCode({
            code
          }).then((res) => {
              setdata(res)
            }).catch((error ) => {
              if(error instanceof InteractionRequiredAuthError){
                 if (inProgress === "none") {
                   //If loginHint claim is provided, dont use sid
                   instance.loginPopup({
                     loginHint //Prefer loginHint claim over referredUsername (email)
                    }).then((res) => {
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
  }, [instance, inProgress]);
```
