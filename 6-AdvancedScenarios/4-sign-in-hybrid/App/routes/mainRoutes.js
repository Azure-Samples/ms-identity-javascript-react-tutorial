const express = require("express");
const path = require("path");

const authController = require("../controllers/authController");

const router = express.Router();

// authentication routes
router.get("/auth/login", authController.loginUser);
router.post("/redirect", authController.handleRedirectWithCode);
router.get("/auth/logout", authController.logoutUser);

// fetches the SPA authorization code if the user is authenticated
router.get("/auth/fetchCode", authController.sendSPACode);

router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

module.exports = router;
