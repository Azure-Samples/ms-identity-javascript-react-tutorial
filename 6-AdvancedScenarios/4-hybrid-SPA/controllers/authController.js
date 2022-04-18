const appSettings = require('../appSettings');
const msalInstance = require('../msal');
const url = require('url');


exports.loginUser = async (req, res) => {
    const authCodeUrlParameters = {
        redirectUri: appSettings.appCredentials.redirectUri,
        responseMode: "form_post",
    };

    const urls  = await msalInstance.getAuthCodeUrl(authCodeUrlParameters)
    res.json(urls)
}

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
    res.status(200).json({code: req.session.code});
}

exports.handleProtectedPath = (req,  res) => {

     res.status(200).json({
        'name': req.authInfo['name'],
        'issued-by': req.authInfo['iss'],
        'issued-for': req.authInfo['aud'],
        'scope': req.authInfo['scp']
    });
       
}



