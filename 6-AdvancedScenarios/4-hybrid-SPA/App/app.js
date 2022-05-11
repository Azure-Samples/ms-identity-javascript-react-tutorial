require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const expressSession = require("express-session");
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

const port = process.env.PORT || 5000;

app.use(mainRouter());
app.listen(port);

console.log("App is listening on port " + port);
