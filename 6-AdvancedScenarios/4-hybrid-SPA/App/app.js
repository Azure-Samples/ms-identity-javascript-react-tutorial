require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const expressSession = require("express-session");
const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;
const mainRouter = require("./routes/mainRoutes");

app.use(express.json());
app.use(express.static(path.join(__dirname, "client/build")));
app.use(express.urlencoded({ extended: false }));

app.use(
  expressSession({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const bearerOptions = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
  clientID: process.env.CLIENT_ID,
  audience: process.env.CLIENT_ID, // audience is this application
  validateIssuer: true,
  passReqToCallback: false,
  loggingLevel: "info",
  scope: [process.env.API_REQUIRED_PERMISSION], // scope you set during app registration
};

const bearerStrategy = new BearerStrategy(bearerOptions, (token, done) => {
  // Send user info using the second argument
  done(null, {}, token);
});

app.use(passport.initialize());

passport.use(bearerStrategy);

app.use(
  "/api/hello",
  passport.authenticate("oauth-bearer", { session: false }) // validate access tokens
);

const port = process.env.PORT || 5000;

app.use(mainRouter(__dirname));
app.listen(port);

console.log("App is listening on port " + port);
