const express = require('express');
const dashboardController = require('../controllers/adminController');


module.exports = (authProvider) => {

    const router = express.Router();

    // main routes
    router.get('/', (req, res, next) => res.redirect('/admin/home'));
    router.get('/home', dashboardController.getHomePage);

    // authentication routes
    router.get('/signin', authProvider.signIn({ postLoginRedirect: '/admin' }));
    router.get('/signout', authProvider.signOut({ postLogoutRedirect: '/admin' }));

    // check if user is authenticated, then obtain an access token for the specified resource
    router.get(
        '/dashboard',
        authProvider.isAuthenticated(),
        authProvider.getToken({
            resource: authProvider.appSettings.protectedResources.msGraphAcrs
        }),
        dashboardController.getDashboardPage
    );

    router.post(
        '/dashboard',
        authProvider.isAuthenticated(),
        dashboardController.postDashboardPage
    );

    router.get(
        '/details',
        authProvider.isAuthenticated(),
        dashboardController.getDetailsPage
    );

    router.post(
        '/details',
        authProvider.isAuthenticated(),
        dashboardController.postDetailsPage
    );

    router.delete(
        '/details',
        authProvider.isAuthenticated(),
        dashboardController.deleteDetailsPage
    );

    // unauthorized
    router.get('/unauthorized', (req, res) => res.redirect('/401.html'));

    // 404
    router.get('*', (req, res) => res.status(404).redirect('/404.html'));

    return router;
}
