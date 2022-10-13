import { useNavigate, useLocation } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';

export const GraphQuery = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleConfirm = () => {
        navigate(location.state);
    };

    return (
        <div className="data-area-div">
            <p>The application will now query Microsoft Graph to check if you are member of any of the required groups by the application.</p>
            <p>This operation requires <b>Admin Consent</b> for the <b>GroupMember.Read.All</b> scope</p>
            <p>Once this is done, you may go back and try to access again.</p>
            <Button onClick={handleConfirm}>I understand, take me back</Button>
            <br />
            <ListGroup className="list-group-item">
                {props.groupsData.map((gr, id) => (
                    <ListGroupItem className="list-group-item align-items-center" key={id}>
                        {gr}
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );
};
