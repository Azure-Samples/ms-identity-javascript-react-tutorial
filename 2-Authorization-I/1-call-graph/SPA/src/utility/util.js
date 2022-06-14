/**
 *
 * @param {String} claim
 * @param {String} value
 * @param {String} description
 * @param {Number} index
 * @param {Object} claimsObject
 * Populates claim, description, and value into an claimsObject
 */
const populateClaim = (claim, value, description, index, claimsObject) => {
    let claimsArray = [];
    claimsArray[0] = claim;
    claimsArray[1] = value;
    claimsArray[2] = description;
    claimsObject[index] = claimsArray;
};

/**
 *
 * @param {String} date unix timestamp
 * @returns transforms  Unix timestamp to date and returns a string value of that date
 */
const changeDateFormat = (date) => {
    let dateObj = new Date(date * 1000);
    return dateObj.toString();
};

/**
 *
 * @param {Object} claims  ID token calims
 * @returns Object ID token claims with description for each claim
 */
export const createClaimsTable = (claims) => {
    let claimsObj = {};
    let index = 0;
    Object.keys(claims).map((key) => {
        switch (key) {
            case 'aud':
                populateClaim(
                    key,
                    claims[key],
                    "Identifies the intended recipient of the token. In id_tokens, the audience is your app's Application ID, assigned to your app in the Azure portal. This value should be validated. The token should be rejected if it fails to match your app's Application ID",
                    index,
                    claimsObj
                );
                index++;
                break;

            case 'iss':
                populateClaim(
                    key,
                    claims[key],
                    'Identifies the issuer, or authorization server that constructs and returns the token. It also identifies the Azure AD tenant for which the user was authenticated. If the token was issued by the v2.0 endpoint, the URI will end in /v2.0. The GUID that indicates that the user is a consumer user from a Microsoft account is 9188040d-6c67-4c5b-b112-36a304b66dad. Your app should use the GUID portion of the claim to restrict the set of tenants that can sign in to the app, if applicable.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'iat':
                populateClaim(
                    key,
                    changeDateFormat(claims[key]),
                    'Issued At indicates when the authentication for this token occurred.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'nbf':
                populateClaim(
                    key,
                    changeDateFormat(claims[key]),
                    'The nbf (not before) claim identifies the time before which the JWT MUST NOT be accepted for processing.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'exp':
                populateClaim(
                    key,
                    changeDateFormat(claims[key]),
                    "The exp (expiration time) claim identifies the expiration time on or after which the JWT must not be accepted for processing. It's important to note that in certain circumstances, a resource may reject the token before this time. For example, if a change in authentication is required or a token revocation has been detected.",
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'name':
                populateClaim(
                    key,
                    claims[key],
                    "The name claim provides a human-readable value that identifies the subject of the token. The value isn't guaranteed to be unique, it can be changed, and it's designed to be used only for display purposes. The profile scope is required to receive this claim.",
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'preferred_username':
                populateClaim(
                    key,
                    claims[key],
                    'The primary username that represents the user. It could be an email address, phone number, or a generic username without a specified format. Its value is mutable and might change over time. Since it is mutable, this value must not be used to make authorization decisions. It can be used for username hints, however, and in human-readable UI as a username. The profile scope is required in order to receive this claim. Present only in v2.0 tokens.',
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
                    'The **oid** (User’s object id) is the only claim that should be used to uniquely identify a user in an Azure AD tenant. The token might have one or more of the following claim, that might seem like a unique identifier, but is not and should not be used as such, especially for systems which act as system of record (SOR)',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'tid':
                populateClaim(
                    key,
                    claims[key],
                    'The tenant id. You will use this claim to ensure that only users from the current Azure Ad tenant can access this app',
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
                    'might be unique amongst the active set of users in a tenant but tend to get reassigned to new employees as employees leave the organization and others take their place.',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'acct':
                populateClaim(
                    key,
                    claims[key],
                    'Available as an optional claim, it lets you know what the type of user (homed, guest) is. For example, for an individual’s access to their data you might not care for this claim, but you would use this along with tenant id (tid) to control access to say a companywide dashboard to just employees (homed users) and not contractors (guest users) ',
                    index,
                    claimsObj
                );
                index++;
                break;
            case 'sid':
                populateClaim(key, claims[key], 'Session ID, used for per-session user sign-out.', index, claimsObj);
                index++;
                break;
            default:
                console.log('Claims not found');
        }
    });
    return claimsObj;
};
