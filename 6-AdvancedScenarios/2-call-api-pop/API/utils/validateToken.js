const jwtDecode = require('jsonwebtoken').decode;
const { jwtVerify } = require('jose/jwt/verify');
const { parseJwk } = require('jose/jwk/parse');

const validatePoP = async (req, res, next) => {
    // the access token the user sent
    const userToken = req.get('authorization').split(' ')[1];
    const decodedToken = jwtDecode(userToken, { complete: true });
    
    try {
        parsedToken = await parseJwk(decodedToken.payload.cnf.jwk, "RS256");

        try {
            verifiedToken = await jwtVerify(userToken, parsedToken);
            
            if (JSON.stringify(verifiedToken.payload) === JSON.stringify(decodedToken.payload)) {
                
                const checkMethod = verifiedToken.payload.m === req.method ? true : false;
                const checkHost = verifiedToken.payload.u.includes(req.hostname) ? true : false;
                const checkPath = verifiedToken.payload.p.includes(`${req.baseUrl}${req.path}`) ? true : false;

                if (checkMethod && checkHost && checkPath) {
                    req.headers.authorization = "Bearer " + verifiedToken.payload.at;
                    return next();
                } else {
                    return res.status(401).json({message: "Invalid token claims"});
                }
            }
        } catch (error) {
            console.log(error)
            res.status(401).json(error);
        }
    } catch (error) {
       console.log(error)
       res.status(401).json(error); 
    }
}

module.exports = validatePoP;