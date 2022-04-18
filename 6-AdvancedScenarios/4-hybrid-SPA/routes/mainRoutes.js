const express = require('express');
const authController = require('../controllers/authController')
const path = require("path");
const cookieParser = require('cookie-parser')




module.exports = (dirname) => {

    const router = express.Router();


    // authentication routes
    router.get('/api/login', authController.loginUser);
    router.post('/redirect', authController.handleRedirectWithCode)
    router.get('/api/logout', authController.logoutUser)
    router.get('/api/fetchCode', authController.sendSPACode)
    
    // protected path route    
    router.get("/api/hello", authController.handleProtectedPath)

    
    router.get('*', (req,res) =>{
        res.sendFile(path.join(dirname+ '/client/build/index.html'));
    });



  



    return router
}