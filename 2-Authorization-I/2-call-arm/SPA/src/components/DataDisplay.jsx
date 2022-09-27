import Table from 'react-bootstrap/Table';
import { createClaimsTable } from '../utils/claimUtils';
import { Container, Card, Row } from 'react-bootstrap';

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

export const TenantData = ({ tenantInfo, response }) => {
    return (
        <Container>
            <Row>
                <div className="data-area-div">
                    <p>
                        Acquired an <strong>Access Token </strong>for Azure Resource Manager
                    </p>
                    <p>
                        Calling <strong> Azure Resource Manager API</strong>...
                    </p>
                    <ul>
                        <li>
                            <strong>endpoint:</strong>{' '}
                            <mark>https://management.azure.com/tenants?api-version=2021-01-01</mark>
                        </li>
                        <li>
                            <strong>scope:</strong>
                            <mark>
                                {response.scopes.map((scope, index) => (
                                    <mark key={scope}>{scope}</mark>
                                ))}
                            </mark>
                        </li>
                    </ul>
                    <p>
                        Contents of the <strong>response</strong> is below:
                    </p>
                </div>
            </Row>
            <Row className="d-flex flex-column justify-content-center align-items-center">
                {tenantInfo.map((tenant) => (
                    <Card className="card" key={tenant.id}>
                        <Card.Body>
                            <Card.Title>{tenant.displayName}</Card.Title>
                            <Card.Text>{tenant.tenantId}</Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </Row>
        </Container>
    );
};
