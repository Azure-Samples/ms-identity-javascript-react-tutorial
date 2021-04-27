import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import { useHistory } from "react-router-dom";

export const GraphQuery = (props) => {
    const history = useHistory();

    const handleConfirm = () => {
        history.push(history.location.state.origin, { groupsData: props.groupsData });
    };

    return (
        <div className="data-area-div">
            <p>The following is the list of all the groups that you are a member of.</p>
            <p>You'll be redirected back, and the app will check if you belong to an authorized group.</p>
            <Button onClick={handleConfirm}>I understand</Button>
            <br />
            <ListGroup className="list-group-item">
                {props.groupsData.map((gr, id) => <ListGroupItem className="list-group-item align-items-center" key={id}>{gr}</ListGroupItem>)}
            </ListGroup>
        </div>
    );
}