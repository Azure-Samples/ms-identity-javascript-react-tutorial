import { msalInstance } from './index';

import { SubscriptionClient } from '@azure/arm-resources-subscriptions';
import { BlobServiceClient } from '@azure/storage-blob';
import { protectedResources, storageInformation } from './authConfig';

/**
 * Returns a subscription client object with the provided token acquisition options
 */
export const getSubscriptionClient = async () => {
    const browserCredential = new BrowserCredential(msalInstance, protectedResources.armTenants.scopes);
    await browserCredential.prepare();

    const client = new SubscriptionClient(browserCredential);
    return client;
};

/**
 * Returns a blob service client object with the provided token acquisition options
 */
export const getBlobServiceClient = async () => {
    const browserCredential = new BrowserCredential(msalInstance, protectedResources.armBlobStorage.scopes);
    await browserCredential.prepare();
    const client = new BlobServiceClient(
        `https://${storageInformation.accountName}.blob.core.windows.net`,
        browserCredential
    );
    return client;
};


/**
 * This class implements TokenCredential interface more information see:
 * https://docs.microsoft.com/en-us/javascript/api/@azure/core-auth/tokencredential?view=azure-node-latest
 */
class BrowserCredential {
    publicApp;
    hasAuthenticated = false;
    scopes;

    constructor(msalInstance, scopes) {
        this.publicApp = msalInstance;
        this.scopes = scopes;
    }

    // Either confirm the account already exists in memory, or tries to parse the redirect URI values.
    async prepare() {
        try {
            if (await this.publicApp.getActiveAccount()) {
                this.hasAuthenticated = true;
                return;
            }
            await this.publicApp.handleRedirectPromise();
            this.hasAuthenticated = true;
        } catch (e) {
            console.error('BrowserCredential prepare() failed', e);
        }
    }

    // Should be true if prepare() was successful.
    isAuthenticated() {
        return this.hasAuthenticated;
    }

    // If called, triggers authentication via redirection.
    async loginRedirect() {
        const loginRequest = {
            scopes: this.scopes,
        };
        await this.app.loginRedirect(loginRequest);
    }

    // Tries to retrieve the token without triggering a redirection.
    async getToken() {
        if (!this.hasAuthenticated) {
            throw new Error('Authentication required');
        }

        const parameters = {
            account: await this.publicApp.getActiveAccount(),
            scopes: this.scopes,
        };

        const result = await this.publicApp.acquireTokenSilent(parameters);
        return {
            token: result.accessToken,
            expiresOnTimestamp: result.expiresOn.getTime(),
        };
    }
}
