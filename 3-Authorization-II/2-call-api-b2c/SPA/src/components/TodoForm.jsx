import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

export const TodoForm = (props) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        props.addTask(name);
        setName('');
    }

    const handleChange = (e) => {
        setName(e.target.value);
    }

    return (
        <Form className="todo-form" onSubmit={handleSubmit}>
            <Form.Group>
                <InputGroup className="mb-7">
                    <Form.Control
                        type="text"
                        id="new-todo-input"
                        name="text"
                        autoComplete="off"
                        value={name}
                        onChange={handleChange}
                        placeholder="Enter a task"
                    />
                    <Button variant="primary" type="submit">Add</Button>
                </InputGroup>
            </Form.Group>
        </Form>
    );
}
