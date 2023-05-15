const express = require('express');
const dashboardController = require('../controllers/adminController');
const router = express.Router();

const authProvider = require("../auth/AuthProvider");
const { protectedResources } = require("../authConfig");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/admin/signin'); // redirect to sign-in route
    }

    next();
}

// main routes
router.get('/', (req, res, next) => res.redirect('/admin/home'));
router.get('/home', dashboardController.getHomePage);

// authentication routes
router.get('/signin', authProvider.login);
router.get('/signout', authProvider.logout);
router.post('/redirect', authProvider.handleRedirect);

// check if user is authenticated, then obtain an access token for the specified resource
router.get(
    '/dashboard',
    isAuthenticated,
    authProvider.getToken(protectedResources.msGraphAcrs.scopes),
    dashboardController.getDashboardPage
);

router.post('/dashboard', isAuthenticated, dashboardController.postDashboardPage);

router.get('/details', isAuthenticated, dashboardController.getDetailsPage);

router.post('/details', isAuthenticated, dashboardController.postDetailsPage);

router.delete('/details', isAuthenticated, dashboardController.deleteDetailsPage);

// unauthorized
router.get('/unauthorized', (req, res) => res.redirect('/401.html'));

// 404
router.get('*', (req, res) => res.status(404).redirect('/404.html'));

module.exports = router;
