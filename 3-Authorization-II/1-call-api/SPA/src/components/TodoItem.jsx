import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";

const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}

export const TodoItem = (props) => {
    const [isEditing, setEditing] = useState(false);
    const [newName, setNewName] = useState('');

    const editFieldRef = useRef(null);
    const editButtonRef = useRef(null);

    const wasEditing = usePrevious(isEditing);

    const handleChange = (e) => {
        setNewName(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newName.trim()) {
            return;
        }

        props.editTask(props.id, newName);
        setNewName('');
        setEditing(false);
    }

    const editingTemplate = (
        <div className="todo-edit">
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label htmlFor={props.id}>New name for {props.name}</Form.Label>
                <Form.Control
                    id={props.id}
                    type="text"
                    value={newName}
                    onChange={handleChange}
                    ref={editFieldRef}
                />
            </Form.Group>
            <div className="btn-group">
                <ButtonGroup>
                    <Button variant="warning" type="button" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button variant="success" type="submit">Save</Button>
                </ButtonGroup>
            </div>
        </Form>
        </div>
    );

    const viewTemplate = (
        <div className="todo-view">
            <Form.Group>
                <Form.Check
                    inline
                    id={props.id}
                    type="checkbox"
                    defaultChecked={props.completed}
                    onChange={() => props.completeTask(props.id)}
                />
                <label className="todo-label" htmlFor={props.id}>
                    {props.name}
                </label>
                <ButtonGroup className="todo-view-btn">
                    <Button variant="warning" onClick={() => setEditing(true)} ref={editButtonRef}>Edit</Button>
                    <Button variant="danger" onClick={() => props.deleteTask(props.id)}>Delete</Button>
                </ButtonGroup>
            </Form.Group>
        </div>
    );

    useEffect(() => {

        if (!wasEditing && isEditing) {
            editFieldRef.current.focus();
        }

        if (wasEditing && !isEditing) {
            editButtonRef.current.focus();
        }

    }, [wasEditing, isEditing]);

    return <ListGroup.Item className="todo-item">{isEditing ? editingTemplate : viewTemplate}</ListGroup.Item>;
}
