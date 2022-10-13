
import { SubscriptionClient } from '@azure/arm-resources-subscriptions';
import { BlobServiceClient } from '@azure/storage-blob';
import { storageInformation } from './authConfig';

/**
 * Returns a subscription client object with the provided token acquisition options
 */
export const getSubscriptionClient = async (accessToken) => {
      const credential = new StaticTokenCredential({
          token: accessToken,
          expiresOnTimestamp: accessToken.exp
      });

    const client = new SubscriptionClient(credential);
    return client;
};

/**
 * Returns a blob service client object with the provided token acquisition options
 */
export const getBlobServiceClient = async (accessToken) => {

    const credential = new StaticTokenCredential({
        token: accessToken,
        expiresOnTimestamp: accessToken.exp,
    });

    const client = new BlobServiceClient(`https://${storageInformation.accountName}.blob.core.windows.net`, credential);
    return client;
};


/**
 * StaticTokenCredential implements the TokenCredential abstraction. 
 * It takes a pre-fetched access token in its constructor as an AccessTokhttps://docs.microsoft.com/javascript/api/@azure/core-auth/accesstoken) 
 * and returns that from its implementation of `getToken()`.
 */
class StaticTokenCredential {
  constructor(accessToken) {
    this.accessToken = accessToken; 
  }

  async getToken() {
    return this.accessToken;
  }

}
