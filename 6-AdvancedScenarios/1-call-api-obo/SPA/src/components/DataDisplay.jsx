import { createClaimsTable } from '../utils/claimUtils';
import { Table } from 'react-bootstrap';
import { protectedResources } from '../authConfig';

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
    const tableRows = Object.entries(props.helloData).map(([ key, value ], index) => {
        return (
            <tr key={index}>
                <td>
                    <b>{key}: </b>
                </td>
                <td>{value}</td>
            </tr>
        );
    });

    return (
        <>
            <div className="data-area-div">
                <p>
                    Calling <strong>custom protected web API</strong>...
                </p>
                <ul>
                    <li>
                        <strong>endpoint:</strong> <mark>{protectedResources.apiHello.endpoint}</mark>
                    </li>
                    <li>
                        <strong>scope:</strong> <mark>{protectedResources.apiHello.scopes[0]}</mark>
                    </li>
                </ul>
                <p>
                    Contents of the <strong>response</strong> is below:
                </p>
            </div>
            <div className="data-area-div">
                <table>
                    <thead></thead>
                    <tbody>{tableRows}</tbody>
                </table>
            </div>
        </>
    );
};
