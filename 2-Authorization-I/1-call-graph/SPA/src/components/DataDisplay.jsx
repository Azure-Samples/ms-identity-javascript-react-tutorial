import "../styles/App.css";

export const ProfileData = (props) => {
    return (
        <>
        <div className="table-area-div">
            <p>Calling <strong>Microsoft Graph API</strong>...</p>
            <ul>
                <li><strong>resource:</strong> <mark>User</mark> object</li>
                <li><strong>endpoint:</strong> <mark>https://graph.microsoft.com/v1.0/me</mark></li>
                <li><strong>scope:</strong> <mark>user.read</mark></li>
            </ul>
            <p>Contents of the <strong>response</strong> is below:</p>
        </div>
        <div id="profile-div">
            <p><strong>Name: </strong> {props.graphData.givenName}</p>
            <p><strong>Title: </strong> {props.graphData.jobTitle}</p>
            <p><strong>Mail: </strong> {props.graphData.mail}</p>
            <p><strong>Phone: </strong> {props.graphData.businessPhones[0]}</p>
            <p><strong>Location: </strong> {props.graphData.officeLocation}</p>
        </div>
        </>
    );
}

export const MailsData = (props) => {
    const mails = props.mailsData.value.map((mail, index) => {
        return (
            <div key={index}>
                <p>{mail.subject}</p>
                <p>{mail.from.emailAddress.address}</p>
                <p>{mail.bodyPreview}</p>
                <hr />
            </div>
        )
    });

    return (
        <>
            <div className="table-area-div">
                <p>Calling <strong>Microsoft Graph API</strong>...</p>
                <ul>
                    <li><strong>resource:</strong> <mark>User</mark> object</li>
                    <li><strong>endpoint:</strong> <mark>https://graph.microsoft.com/v1.0/me/messages</mark></li>
                    <li><strong>scope:</strong> <mark>user.read</mark></li>
                </ul>
                <p>Contents of the <strong>response</strong> is below:</p>
            </div>
            <div id="mails-div">
                {mails}
            </div>
        </>
    );
}

export const TenantData = (props) => {
    const tableRows = Object.entries(props.tenantData.value[0]).map((entry, index) => {
        return (<tr key={index}>
            <td><b>{entry[0]}: </b></td>
            <td>{entry[1]}</td>
        </tr>)
    });

    return (
        <>
            <div className="table-area-div">
                <p>Calling <strong>Azure Resource Manager API</strong>...</p>
                <ul>
                    <li><strong>resource:</strong> <mark>Tenant</mark> object</li>
                    <li><strong>endpoint:</strong> <mark>https://management.azure.com/tenants?api-version=2020-01-01</mark></li>
                    <li><strong>scope:</strong> <mark>https://management.azure.com/user_impersonation</mark></li>
                </ul>
                <p>Contents of the <strong>response</strong> is below:</p>
            </div>
            <div id="tenant-div">
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