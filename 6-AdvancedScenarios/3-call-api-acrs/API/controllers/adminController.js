const AuthContext = require('../models/authContext');
const msGraph = require('../utils/graphClient');

exports.getHomePage = (req, res, next) => {
    res.render('home', { isAuthenticated: req.session.isAuthenticated, username: req.session.isAuthenticated ? req.session.account.username : null });
}

exports.getDetailsPage = (req, res, next) => {
    try {
        const acrsList = AuthContext.getAuthContexts();
        res.render('details', { isAuthenticated: req.session.isAuthenticated, acrsList: acrsList });   
    } catch (error) {
        next(error);
    }
}

exports.postDetailsPage = async(req, res, next) => {
    try {
        const authContext = new AuthContext(
            req.session.account.idTokenClaims.tid, 
            req.body.authContext.split(' ')[0], // id
            req.body.authContext.split(' ')[1], // displayName
            req.body.operation
        );

        AuthContext.postAuthContext(authContext);
        res.redirect('/admin/details');   
    } catch (error) {
        next(error);
    }
}

exports.deleteDetailsPage = async(req, res, next) => {
    try {
        const authContextObject = JSON.parse(req.body.authContextObject);
        AuthContext.deleteAuthContext( authContextObject);
        res.redirect('/admin/details');   
    } catch (error) {
        next(error);
    }
}

exports.getDashboardPage = (req, res, next) => {
    res.render('dashboard', { isAuthenticated: req.session.isAuthenticated, isLoaded: false });
}

exports.postDashboardPage = async(req, res, next) => {
    try {
        // pass the access token to create a graph client
        const graphClient = msGraph.getAuthenticatedClient(req.session.remoteResources["msGraphAcrs"].accessToken);

        let acrs = await graphClient
            .api('/identity/conditionalAccess/authenticationContextClassReferences')
		    .version('beta')
		    .get();

        // check if acrs is empty   
        if (acrs.value.length === 0) {

            defaultAcrsList = [
                {
                    id: 'c1',
                    displayName: 'Require strong authentication',
                    description: 'User needs to perform multifactor authentication',
                    isAvailable: true
                },
                {
                    id: 'c2',
                    displayName: 'Require compliant devices',
                    description: 'Users needs to prove using a compliant device',
                    isAvailable: true
                },
                {
                    id: 'c3',
                    displayName: 'Require trusted locations',
                    description: 'User needs to prove connecting from a trusted location',
                    isAvailable: true
                },
            ]

            try {

                // create default auth contexts
                defaultAcrsList.forEach(async(ac) => {
                    await graphClient
                        .api('/identity/conditionalAccess/authenticationContextClassReferences')
                        .version('beta')
                        .post(ac);
                });

                return res.render('dashboard', { isAuthenticated: req.session.isAuthenticated, isLoaded: true, acrsList: defaultAcrsList });
            } catch (error) {
                next(error);
            }
        } 
            
        res.render('dashboard', { isAuthenticated: req.session.isAuthenticated, isLoaded: true, acrsList: acrs.value });  
    } catch (error) {
        console.log(error);
        next(error);
    }
}
    