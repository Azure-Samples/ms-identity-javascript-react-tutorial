const appSettings = require('../appSettings');
const msalInstance = require('../msal');
const url = require('url');


exports.loginUser = async (req, res) => {

    const authCodeUrlParameters = {
        redirectUri: appSettings.appCredentials.redirectUri,
        responseMode: "form_post",
    };

    msalInstance.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.json(response);
        }).catch((error) => console.log(error))
 }

/**
 * We parse the authorization code in this method and invoke the acquireTokenByCode on the MSAL instance. 
 * Setting set enableSpaAuthorizationCode to true will enable MSAL to acquire a second authorization code to be redeemed by your single-page application. 
 */
exports.handleRedirectWithCode = (req, res) => {
    
    const tokenRequest = {
            code: req.body.code,
            redirectUri: appSettings.appCredentials.redirectUri,
            enableSpaAuthorizationCode: appSettings.appCredentials.enableSpaAuthorizationCode
        };


    
    msalInstance.acquireTokenByCode(tokenRequest)
        .then((response) => {
            const { code } = response;
            req.session.code = code;
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
}

exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        res.status(200).json({message: 'success'})
    })
}

exports.sendSPACode = (req, res) => {

    if(req.session.authenticated) {
        res.status(200).json({code: req.session.code});
    }else {
        res.status(401).json({ message: "user is not authenticated"})
    }

}

exports.handleProtectedPath = (req,  res) => {

     res.status(200).json({
        'name': req.authInfo['name'],
        'issued-by': req.authInfo['iss'],
        'issued-for': req.authInfo['aud'],
        'scope': req.authInfo['scp']
    });
       
}



