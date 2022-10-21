import { Client } from '@microsoft/microsoft-graph-client';
import { protectedResources } from './authConfig';

/**
 * Creating a Graph client instance via options method. For more information, visit:
 * https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/CreatingClientInstance.md#2-create-with-options
 * @param {String} accessToken
 * @returns
 */
const getGraphClient = (accessToken) => {
    // Initialize Graph client
    const graphClient = Client.init({
        // Use the provided access token to authenticate requests
        authProvider: (done) => {
            done(null, accessToken);
        },
    });

    return graphClient;
};

/**
 * Calls the Microsoft Graph API and returns the results
 * @param {String} accessToken 
 * @param {Array} filterGroups 
 * @returns 
 */
export const getFilteredGroups = async (accessToken, filterGroups = []) => {
    let groups = [];

    try {
        // Get a graph client instance for the given access token
        const graphClient = getGraphClient(accessToken);
            
        // Makes request to fetch groups list, which is expected to have multiple pages of data.
        let response = await graphClient.api(protectedResources.apiGraph.endpoint).post({
            groupIds: filterGroups,
        });

        groups = response.value;
        return groups;
    } catch (error) {
        console.log(error);
    }
}