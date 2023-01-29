/**
 * This method inspects the HTTPS response from a fetch call for the "www-authenticate header"
 * If present, it grabs the claims challenge from the header and store it in the localStorage
 * For more information, visit: https://docs.microsoft.com/en-us/azure/active-directory/develop/claims-challenge#claims-challenge-header-format
 * @param {object} response
 * @returns response
 */
const handleClaimsChallenge = async (response) => {
    if (response.status === 200) {
        return await response.json();
    } else if (response.status === 401) {
        if (response.headers.get('WWW-Authenticate')) {
            const authenticateHeader = response.headers.get('WWW-Authenticate');
            const claimsChallenge = parseChallenges(authenticateHeader);
            if (claimsChallenge && claimsChallenge.claims) {
                return {
                    errorMessage: 'claims_challenge_occurred',
                    payload: claimsChallenge.claims,
                };
            }
        }
        throw new Error(`Unauthorized: ${response.status}`);
    } else {
        throw new Error(`Something went wrong with the request: ${response.status}`);
    }
};

/**
   * This method parses WWW-Authenticate authentication headers 
   * @param header
   * @return {Object} challengeMap
   */
const parseChallenges = (header) => {
    const schemeSeparator = header.indexOf(' ');
    const challenges = header.substring(schemeSeparator + 1).split(',');
    const challengeMap = {};

    challenges.forEach((challenge) => {
        const [key, value] = challenge.split('=');
        challengeMap[key.trim()] = decodeURI(value.replace(/['"]+/g, ''));
    });

    return challengeMap;
};

module.exports = {
    handleClaimsChallenge: handleClaimsChallenge,
};
