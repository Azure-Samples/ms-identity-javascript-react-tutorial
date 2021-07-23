const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

/**
 * Creating a Graph client instance via options method. For more information, visit:
 * https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/CreatingClientInstance.md#2-create-with-options
 */
getAuthenticatedClient = (accessToken) => {
    // Initialize Graph client
    const client = graph.Client.init({
        // Use the provided access token to authenticate requests
        authProvider: (done) => {
            done(null, accessToken);
        }
    });

    return client;
}

module.exports = {
    getAuthenticatedClient,
}