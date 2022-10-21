const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const config = require('../authConfig.json');

/**
 * Creating a Graph client instance via options method. For more information, visit:
 * https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/CreatingClientInstance.md#2-create-with-options
 */
getGraphClient = (accessToken) => {
    // Initialize Graph client
    const client = graph.Client.init({
        // Use the provided access token to authenticate requests
        authProvider: (done) => {
            done(null, accessToken);
        }
    });

    return client;
}

/**
 * Calls the Microsoft Graph API and returns the results
 * @param {String} accessToken 
 * @param {Array} filterGroups 
 * @returns 
 */
getFilteredGroups = async (accessToken, filterGroups = []) => {
    let groups = [];

    try {
        // Get a graph client instance for the given access token
        const graphClient = getGraphClient(accessToken);

        // Makes request to fetch groups list, which is expected to have multiple pages of data.
        let response = await graphClient.api(config.protectedResources.graphAPI.endpoint).post({
            groupIds: filterGroups
        });

        groups = response.value;
        return groups;
    } catch (error) {
        console.log(error);
    }

    return groups;
}

module.exports = {
    getFilteredGroups
}