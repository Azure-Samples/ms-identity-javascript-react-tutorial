import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';

export const DashView = (props) => {
    const taskList = props.dashboardData.map((task, i) => (
        <ListGroupItem key={i}>
            <p><b>Owner:</b> {task.owner}</p>
            <p><b>Task:</b> {task.name}</p>
            <p>{task.completed}</p>
        </ListGroupItem>
    ));

    return (
        <div className="data-area-div">
            <ListGroup className="todo-list">{taskList}</ListGroup>
        </div>
    );
};
