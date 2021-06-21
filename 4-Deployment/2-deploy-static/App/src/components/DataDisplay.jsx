import "../styles/App.css";
import { protectedResources } from "../authConfig";

export const ProfileData = (props) => {
    
    // Display data, remove IDs and Phone numbers
    const tableRows = Object.entries(props.graphData).map((entry, index) => {

        const name = entry[0] || "";
        const val = (!entry[1] || entry[1].toString().length===0) 
                    ? ""
                    : (entry[0].toString().toLowerCase().includes("phone") || entry[0].toString().toLowerCase().includes("principal") || entry[0].toString().toLowerCase().includes("mail") || entry[0].toString().toLowerCase().includes("id")) 
                        ? `...` 
                        : entry[1];

        return (<tr key={index}>
            <td><b>{name}: </b></td>
            <td><i>{val}</i></td>
        </tr>)
    });

    return (
        <>
            <div className="data-area-div">
                <p>Calling <strong>Microsoft Graph API</strong>...</p>
                <ul>
                    <li><strong>resource:</strong> <mark>User</mark> object</li>
                    <li><strong>endpoint:</strong> <mark>https://graph.microsoft.com/v1.0/me</mark></li>
                    <li><strong>scope:</strong> <mark>user.read</mark></li>
                </ul>
                <p>Contents of the <strong>response</strong> is below:</p>
            </div>
            <div className="data-area-div">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export const FunctionData = (props) => {

    // Display data, remove IDs and Phone numbers
    const tableRows = Object.entries(props.functionData.response).map((entry, index) => {

        const name = entry[0] || "";
        const val = (!entry[1] || entry[1].toString().length===0) 
                    ? ""
                    : (entry[0].toString().toLowerCase().includes("phone") || entry[0].toString().toLowerCase().includes("principal") || entry[0].toString().toLowerCase().includes("mail") || entry[0].toString().toLowerCase().includes("id")) 
                        ? `...` 
                        : entry[1];

        return (<tr key={index}>
            <td><b>{name}: </b></td>
            <td><i>{val}</i></td>
        </tr>)
    });

    return (
        <>
            <div className="data-area-div">
                <p>Calling <strong>protected Azure Function API (which in turn calls Microsoft Graph)</strong>...</p>
                <ul>
                    <li><strong>endpoint:</strong> <mark>{protectedResources.functionApi.endpoint}</mark></li>
                    <li><strong>scope:</strong> <mark>{protectedResources.functionApi.scopes[0]}</mark></li>
                </ul>
                <p>Contents of the <strong>response</strong> is below:</p>
            </div>
            <div className="data-area-div">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        </>
    );
}