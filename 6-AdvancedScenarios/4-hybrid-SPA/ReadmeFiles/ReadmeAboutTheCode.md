
### SPA Authorization Code issuing in the back-end

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

### Redming the SPA Authorization Code in the client-side

```javascript

    callApiToGetSpaCode()
        .then((data) => {
        if(inProgress === "none"){
          let code = data.code;
          instance.acquireTokenByCode({code})
            .then((res) => {
              console.log(res, " res")
            }).catch((error) => {
              if(error instanceof InteractionRequiredAuthError){
                 if (inProgress === "none") {
                   instance.acquireTokenPopup({code})
                      .then((res) => {
                        console.log(res, " res")
                      }).catch((error) => {
                        console.log(error)
                      })
                 }
              }
          })
        }
      })
    }
```
