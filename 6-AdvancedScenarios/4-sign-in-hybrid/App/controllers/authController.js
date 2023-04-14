require("dotenv").config();
const msalInstance = require("../msal");
const port = process.env.PORT || 5000;

exports.loginUser = async (req, res, next) => {
  const authCodeUrlParameters = {
    redirectUri: process.env.REDIRECT_URI,
    responseMode: "form_post",
    scopes: ["User.Read"],
  };

  msalInstance
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      next(error);
    });
};

/**
 * We parse the authorization code in this method and invoke the acquireTokenByCode on the MSAL instance.
 * Setting set enableSpaAuthorizationCode to true will enable MSAL to acquire a second authorization code
 * to be redeemed by your single-page application.
 */
exports.handleRedirectWithCode = (req, res, next) => {
  const tokenRequest = {
    code: req.body.code,
    redirectUri: process.env.REDIRECT_URI,
    enableSpaAuthorizationCode: true,
    scopes: ["User.Read"],
  };
  
  msalInstance
    .acquireTokenByCode(tokenRequest)
    .then((response) => {
      const { code } = response; //SPA authorization code

      const {
        sid, // session ID claim, used for non-hybrid
        login_hint: loginHint, // new login_hint claim (used instead of sid or email)
        preferred_username: preferredUsername,
      } = response.idTokenClaims;

      req.session.code = code;
      req.session.loginHint = loginHint;
      req.session.sid = sid;
      req.session.referredUsername = preferredUsername;
      req.session.authenticated = true;

      const urlFrom = (urlObject) => String(Object.assign(new URL(`http://localhost:${port}`), urlObject));

      res.redirect(
        urlFrom({
          protocol: "http",
          pathname: "/",
          search: "getCode=true",
        })
      );
    })
    .catch((err) => {
      next(err);
    });
};

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    res.status(200).json({ message: "success" });
  });
};

exports.sendSPACode = (req, res) => {
  if (req.session.authenticated) {
    res.status(200).json({ ...req.session });
  } else {
    res.status(401).json({ message: "user is not authenticated" });
  }
};
