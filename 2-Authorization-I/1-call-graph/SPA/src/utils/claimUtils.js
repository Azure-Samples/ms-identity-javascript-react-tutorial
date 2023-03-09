import { AccountInfo } from '@azure/msal-browser';
import { addClaimsToStorage } from './storageUtils';

/**
 * Populate claims table with appropriate description
 * @param {Object} claims ID token claims
 * @returns claimsObject
 */
export const createClaimsTable = (claims) => {
    let claimsObj = {};
    let index = 0;

    Object.keys(claims).map((key) => {
        if (typeof claims[key] !== 'string' && typeof claims[key] !== 'number') return;
        switch (key) {
            case 'aud':
                populateClaim(
                    key,
                    claims[key],
                    "Identifies the intended recipient of the token. In ID tokens, the audience is your app's Application ID, assigned to your app in the Azure portal.",
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'iss':
                populateClaim(
                    key,
                    claims[key],
                    'Identifies the issuer, or authorization server that constructs and returns the token. It also identifies the Azure AD tenant for which the user was authenticated. If the token was issued by the v2.0 endpoint, the URI will end in /v2.0. The GUID that indicates that the user is a consumer user from a Microsoft account is 9188040d-6c67-4c5b-b112-36a304b66dad.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'iat':
                populateClaim(
                    key,
                    changeDateFormat(claims[key]),
                    '"Issued At" indicates the timestamp (UNIX timestamp) when the authentication for this user occurred.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'nbf':
                populateClaim(
                    key,
                    changeDateFormat(claims[key]),
                    'The nbf (not before) claim dictates the time (as UNIX timestamp) before which the JWT must not be accepted for processing.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'exp':
                populateClaim(
                    key,
                    changeDateFormat(claims[key]),
                    "The exp (expiration time) claim dictates the expiration time (as UNIX timestamp) on or after which the JWT must not be accepted for processing. It's important to note that in certain circumstances, a resource may reject the token before this time. For example, if a change in authentication is required or a token revocation has been detected.",
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'name':
                populateClaim(
                    key,
                    claims[key],
                    "The name claim provides a human-readable value that identifies the subject of the token. The value isn't guaranteed to be unique, it can be changed, and it's designed to be used only for display purposes. The 'profile' scope is required to receive this claim.",
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'preferred_username':
                populateClaim(
                    key,
                    claims[key],
                    'The primary username that represents the user. It could be an email address, phone number, or a generic username without a specified format. Its value is mutable and might change over time. Since it is mutable, this value must not be used to make authorization decisions. It can be used for username hints, however, and in human-readable UI as a username. The profile scope is required in order to receive this claim.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'nonce':
                populateClaim(
                    key,
                    claims[key],
                    'The nonce matches the parameter included in the original /authorize request to the IDP. If it does not match, your application should reject the token.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'oid':
                populateClaim(
                    key,
                    claims[key],
                    'The oid (user’s object id) is the only claim that should be used to uniquely identify a user in an Azure AD tenant.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'tid':
                populateClaim(
                    key,
                    claims[key],
                    'The id of the tenant where this app resides. You can use this claim to ensure that only users from the current Azure AD tenant can access this app.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'upn':
                populateClaim(
                    key,
                    claims[key],
                    '(user principal name) – might be unique amongst the active set of users in a tenant but tend to get reassigned to new employees as employees leave the organization and others take their place or might change to reflect a personal change like marriage.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'email':
                populateClaim(
                    key,
                    claims[key],
                    'Email might be unique amongst the active set of users in a tenant but tend to get reassigned to new employees as employees leave the organization and others take their place.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'acct':
                populateClaim(
                    key,
                    claims[key],
                    'Available as an optional claim, it lets you know what the type of user (homed, guest) is. For example, for an individual’s access to their data you might not care for this claim, but you would use this along with tenant id (tid) to control access to say a company-wide dashboard to just employees (homed users) and not contractors (guest users).',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'sid':
                populateClaim(key, claims[key], 'Session ID, used for per-session user sign-out.', index, claimsObj);
                index++;
                break;
            case 'sub':
                populateClaim(
                    key,
                    claims[key],
                    'The sub claim is a pairwise identifier - it is unique to a particular application ID. If a single user signs into two different apps using two different client IDs, those apps will receive two different values for the subject claim.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'ver':
                populateClaim(
                    key,
                    claims[key],
                    'Version of the token issued by the Microsoft identity platform',
                    index,
                    claimsObj
                );
                index++;
                break;
            case "login_hint":
                 populateClaim(
                     key,
                     claims[key],
                     ' An opaque, reliable login hint claim. This claim is the best value to use for the login_hint OAuth parameter in all flows to get SSO.',
                     index,
                     claimsObj
                 );
                index++;
                break;
            case "idtyp":
                  populateClaim(
                      key,
                      claims[key],
                      'Value is app when the token is an app-only token. This is the most accurate way for an API to determine if a token is an app token or an app+user token',
                      index,
                      claimsObj
                  );
                break;
            case 'uti':
            case 'rh':
                index++;
                break;
            default:
                populateClaim(key, claims[key], '', index, claimsObj);
                index++;
        }
    });

    return claimsObj;
};

/**
 * Populates claim, description, and value fields in a claimsObject
 * @param {String} claim
 * @param {String} value
 * @param {String} description
 * @param {Number} index
 * @param {Object} claimsObject
 */
const populateClaim = (claim, value, description, index, claimsObject) => {
    let claimsArray = [];
    claimsArray[0] = claim;
    claimsArray[1] = value;
    claimsArray[2] = description;
    claimsObject[index] = claimsArray;
};

/**
 * Transforms Unix timestamp to date and returns a string value of that date
 * @param {String} date Unix timestamp
 * @returns
 */
const changeDateFormat = (date) => {
    let dateObj = new Date(date * 1000);
    return `${date} - [${dateObj.toString()}]`;
};


/**
 * This method parses WWW-Authenticate authentication headers 
 * @param header
 * @return {Object} challengeMap
 */
export const parseChallenges = (header) => {
    const schemeSeparator = header.indexOf(' ');
    const challenges = header.substring(schemeSeparator + 1).split(',');
    const challengeMap = {};

    challenges.forEach((challenge) => {
        const [key, value] = challenge.split('=');
        challengeMap[key.trim()] = window.decodeURI(value.replace(/['"]+/g, ''));
    });

    return challengeMap;
};

/**
 * This method inspects the HTTPS response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header and store it in the localStorage
 * For more information, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {Object} response
 * @param {string} apiEndpoint
 * @param {AccountInfo} account
 * @returns response
 */
export const handleClaimsChallenge = async (response, apiEndpoint, account) => {
    if (response.status === 200) {
        return response.json();
    }

    if (response.status === 401) {
        if (response.headers.get('WWW-Authenticate')) {
            const authenticateHeader = response.headers.get('WWW-Authenticate');
            const claimsChallenge = parseChallenges(authenticateHeader);

            /**
             * This method stores the claim challenge to the session storage in the browser to be used when 
             * acquiring a token. To ensure that we are fetching the correct claim from the storage, we are 
             * using the clientId of the application and oid (user’s object id) as the key identifier of 
             * the claim with schema cc.<clientId>.<oid>.<resource.hostname>
             */
            addClaimsToStorage(
                claimsChallenge.claims,
                `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${new URL(apiEndpoint).hostname}`
            );

            const err = new Error("A claims challenge has occurred");
            err.name = 'ClaimsChallengeAuthError';
            throw err;
        }

        throw new Error(`Unauthorized: ${response.status}`);
    } else {
        throw new Error(`Something went wrong with the request: ${response.status}`);
    }
};
