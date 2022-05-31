require("dotenv").config();

const express = require("express");
const expressSession = require("express-session");
const path = require("path");

const mainRouter = require("./routes/mainRoutes");

const port = process.env.PORT || 5000;

const app = express();

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

app.use(mainRouter);

app.listen(port, () => console.log(`Sample app listening on port ${port}!`));
