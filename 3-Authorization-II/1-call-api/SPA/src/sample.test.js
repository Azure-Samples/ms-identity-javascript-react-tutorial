import { PublicClientApplication } from "@azure/msal-browser";
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';


describe('Sanitize configuration object', () => {
    beforeAll(() => {
        global.msalConfig = require('./authConfig.js').msalConfig;
    });

    it('should define the config object', () => {
        expect(global.msalConfig).toBeDefined();
    });

    it('should not contain credentials', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(global.msalConfig.auth.clientId)).toBe(false);
    });

    it('should contain authority uri', () => {
        const regexUri = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        expect(regexUri.test(global.msalConfig.auth.authority)).toBe(true);
    });

    it('should not contain tenant id', () => {
        const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(regexGuid.test(global.msalConfig.auth.authority.split('.com/')[1])).toBe(false);
    });

    it('should define a redirect uri', () => {
        expect(global.msalConfig.auth.redirectUri).toBeDefined();
    });
});

describe('Ensure that the app starts', () => {
    let handleRedirectSpy;
    let pca;
    beforeEach(() => {
        global.msalConfig = require('./authConfig.js').msalConfig;
        pca = new PublicClientApplication(global.msalConfig);
        handleRedirectSpy = jest.spyOn(pca, 'handleRedirectPromise');
    });

    it('should instantiate msal', () => {
        expect(pca).toBeDefined();
        expect(pca).toBeInstanceOf(PublicClientApplication);
    });

    it('should render the app without crashing', async () => {
        render(
            <App instance={pca} />
        );
        await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));
        expect(
            await screen.findByText('Welcome to the Microsoft Authentication Library For React Tutorial')
        ).toBeInTheDocument();
    })
});
