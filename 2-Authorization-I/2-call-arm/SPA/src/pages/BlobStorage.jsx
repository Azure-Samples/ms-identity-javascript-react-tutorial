import { useEffect, useState } from 'react';
import { getBlobServiceClient } from '../azureManagement';
import { protectedResources, storageInformation } from '../authConfig';
import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Container, Row } from 'react-bootstrap';

export const BlobStorage = () => {
    const { instance } = useMsal();
    const [uploadedFile, setUploadedFile] = useState(null);
    const account = instance.getActiveAccount();

    const request = {
        scopes: protectedResources.armBlobStorage.scopes,
        account: account,
    };

    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, request);

    useEffect(() => {
        if (!!error) {
            // in case popup is blocked, use redirect instead
            if (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error') {
                login(InteractionType.Redirect, request);
            }

            console.log(error);
            return;
        }

        if (result) {
            console.log(result);
        }
    }, [login, result, error, instance]);

    const containerExist = async (client, containerName) => {
        let hasContainer = false;
        for await (const container of client.listContainers()) {
            if (container.name === containerName) {
                hasContainer = true;
            }
        }
        return hasContainer;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploadedFile) {
            try {
                const client = await getBlobServiceClient();
                const containerClient = client.getContainerClient(storageInformation.containerName);
                const hasContainer = await containerExist(client, storageInformation.containerName);
                if (hasContainer) {
                    const blockBlobClient = containerClient.getBlockBlobClient(uploadedFile.name);
                    blockBlobClient.uploadData(uploadedFile);
                } else {
                    const createContainerResponse = await containerClient.create();
                    const blockBlobClient = containerClient.getBlockBlobClient(uploadedFile.name);
                    blockBlobClient.uploadData(uploadedFile);
                    console.log('Container was created successfully', createContainerResponse.requestId);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        setUploadedFile(e.target.files[0]);
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Container>
            <Row>
                <div className="data-area-div">
                    <p>
                        Acquired an <strong>Access Token </strong>for Azure Storage with scope:
                        <mark>{protectedResources.armBlobStorage.scopes}</mark>
                    </p>
                    <p>Upload a file to Azure Storage</p>
                </div>
            </Row>
            <Row>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control type="file" placeholder="add file" onChange={handleFileUpload} />
                    </Form.Group>
                    <Button type="submit">Upload</Button>
                </Form>
            </Row>
        </Container>
    );
};
