import "../styles/App.css";

export const ProfileData = (props) => {
    return (
        <div id="profile-div">
            <p><strong>Name: </strong> {props.graphData.givenName}</p>
            <p><strong>Title: </strong> {props.graphData.jobTitle}</p>
            <p><strong>Mail: </strong> {props.graphData.mail}</p>
            <p><strong>Phone: </strong> {props.graphData.businessPhones[0]}</p>
            <p><strong>Location: </strong> {props.graphData.officeLocation}</p>
        </div>
    );
}

export const MailsData = (props) => {
    console.log(props)
    return (
        <div id="mails-div">
        </div>
    );
}

export const TenantData = (props) => {
    console.log(props)
    return (
        <div id="tenant-div">
        </div>
    );
}