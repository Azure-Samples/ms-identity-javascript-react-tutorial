import { useEffect, useState } from 'react';
import { useMsalAuthentication, useMsal } from '@azure/msal-react';
import { Container } from 'react-bootstrap';

import { protectedResources, msalConfig } from '../authConfig';
import { InteractionType, BrowserAuthError } from '@azure/msal-browser';
import { GraphContacts } from '../components/DataDisplay';
import { callApiWithToken } from '../fetch';

const ContactsContent = () => {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const request = {
        scopes: protectedResources.graphContacts.scopes,
        account: account,
        claims:
            account && localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
                ? window.atob(localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`))
                : null, // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}
    };

    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, request);

    const [graphContacts, setGraphContacts] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (result && !graphContacts) {
                try {
                    let contacts = await callApiWithToken(
                        result.accessToken,
                        protectedResources.graphContacts.endpoint,
                        protectedResources.graphContacts.scopes
                    );

                    if (contacts && contacts.error) throw new Error(contacts.error);

                    setGraphContacts(contacts);
                } catch (error) {
                    if (error instanceof BrowserAuthError) {
                        login(InteractionType.Redirect, request);
                    } else {
                        setFetchError(error);
                    }
                }
            }
        };
        fetchData();
    }, [result, error]);
    return (
        <>
            {' '}
            {graphContacts || fetchError ? (
                <GraphContacts response={result} error={fetchError} graphContacts={graphContacts} />
            ) : null}{' '}
        </>
    );
};

export const Contacts = () => {
    return (
        <Container>
            <ContactsContent />
        </Container>
    );
};
