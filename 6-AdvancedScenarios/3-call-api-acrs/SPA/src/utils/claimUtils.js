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
}