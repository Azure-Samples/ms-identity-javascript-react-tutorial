import Table from 'react-bootstrap/Table';
import { Container, Card, Row } from 'react-bootstrap';

import { createClaimsTable } from '../utils/claimUtils';

import '../styles/App.css';

export const IdTokenData = (props) => {
    const tokenClaims = createClaimsTable(props.idTokenClaims);
    const tableRow = Object.keys(tokenClaims).map((key) => {
        return (
            <tr key={key}>
                {tokenClaims[key].map((claimItem) => (
                    <td key={claimItem} className="tableColumn">
                        {claimItem}
                    </td>
                ))}
            </tr>
        );
    });
    return (
        <>
            <div className="data-area-div">
                <p>
                    See below the claims in your <strong> ID token </strong>. For more information, visit:{' '}
                    <span>
                        <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens#claims-in-an-id-token">
                            docs.microsoft.com
                        </a>
                    </span>
                </p>
                <div className="data-area-div table">
                    <Table responsive striped bordered hover>
                        <thead>
                            <tr>
                                <th>Claim</th>
                                <th>Value</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>{tableRow}</tbody>
                    </Table>
                </div>
            </div>
        </>
    );
};

export const ProfileData = (props) => {
    const tableRows = Object.entries(props.graphData).map((entry, index) => {
        return (
            <tr key={index}>
                <td>
                    <b>{entry[0]} </b>
                </td>
                <td>{entry[1]}</td>
            </tr>
        );
    });
    return (
        <>
            <div className="data-area-div">
                <p>
                    Acquired an <strong>Access Token </strong>for MS Graph with scopes:
                    {props.response.scopes.map((scope, index) => (
                        <mark key={scope}>{scope}</mark>
                    ))}
                </p>

                <p>
                    Calling <strong>Microsoft Graph API</strong>...
                </p>
                <ul>
                    <li>
                        <strong>resource:</strong> <mark>User</mark> object
                    </li>
                    <li>
                        <strong>endpoint:</strong> <mark>https://graph.microsoft.com/v1.0/me</mark>
                    </li>
                    <li>
                        <strong>scope:</strong>
                        <mark>User.Read</mark>
                    </li>
                </ul>
                <p>
                    Contents of the <strong>response</strong> is below:
                </p>
            </div>
            <div className="data-area-div">
                <Table responsive striped bordered hover>
                    <thead></thead>
                    <tbody>{tableRows}</tbody>
                </Table>
            </div>
        </>
    );
};

export const ContactsData = (props) => {
    return (
        <Container>
            <Row>
                <div className="data-area-div">
                    <p>
                        Acquired an <strong>Access Token </strong>for MS Graph with scopes:
                        {props.response.scopes.map((scope, index) => (
                            <mark key={scope}>{scope}</mark>
                        ))}
                    </p>

                    <p>
                        Calling <strong>Microsoft Graph API</strong>...
                    </p>
                    <ul>
                        <li>
                            <strong>resource:</strong>
                            <mark>User</mark> object
                        </li>
                        <li>
                            <strong>endpoint:</strong> <mark>https://graph.microsoft.com/v1.0/me/contacts</mark>
                        </li>
                        <li>
                            <strong>scope:</strong>
                            <mark>Contacts.Read</mark>
                        </li>
                    </ul>
                    <p>
                        Contents of the <strong>response</strong> is below:
                    </p>
                </div>
            </Row>
            <Row className="d-flex flex-row">
                {!props.graphContacts.value  || props.graphContacts.value.length === 0 ? (
                    <p className="text-center">You have 0 contacts</p>
                ) : (
                    props.graphContacts.value.map((contact) => (
                        <Card className="card" key={contact.id}>
                            <Card.Body>
                                <Card.Title>{contact.displayName}</Card.Title>
                                <Card.Text>{contact.personalNotes}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </Row>
        </Container>
    );
};
