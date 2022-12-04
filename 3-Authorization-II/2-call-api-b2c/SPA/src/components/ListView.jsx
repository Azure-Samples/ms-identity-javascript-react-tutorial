import React, { useState, useRef, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { nanoid } from "nanoid";
import ListGroup from "react-bootstrap/ListGroup";

import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

import useFetchWithMsal from '../hooks/useFetchWithMsal';
import { protectedResources } from "../authConfig";

function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}

export const ListView = (props) => {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();

    const { error, execute } = useFetchWithMsal({
        scopes: protectedResources.apiTodoList.scopes.write
    });

    const [tasks, setTasks] = useState(props.todoListData);

    const handleCompleteTask = (id) => {
        const updatedTask = tasks.find(task => id === task.id);
        updatedTask.completed = !updatedTask.completed;

        execute("PUT", protectedResources.apiTodoList.endpoint + `/${id}`, updatedTask).then(() => {
            const updatedTasks = tasks.map(task => {
                if (id === task.id) {
                    return { ...task, completed: !task.completed }
                }
                return task;
            });
            setTasks(updatedTasks);
        });
    }

    const handleAddTask = (name) => {
        const newTask = {
            owner: account.idTokenClaims?.sub,
            id: nanoid(),
            name: name,
            completed: false
        };

        execute("POST", protectedResources.apiTodoList.endpoint, newTask).then((response) => {
            if (response && response.message === "success") {
                setTasks([...tasks, newTask]);
            }
        })
    }

    const handleDeleteTask = (id) => {
        execute("DELETE", protectedResources.apiTodoList.endpoint + `/${id}`).then((response) => {
            if (response && response.message === "success") {
                const remainingTasks = tasks.filter(task => id !== task.id);
                setTasks(remainingTasks);
            }
        });
    }

    const handleEditTask = (id, newName) => {
        const updatedTask = tasks.find(task => id === task.id);
        updatedTask.name = newName;

        execute("PUT", protectedResources.apiTodoList.endpoint + `/${id}`, updatedTask).then(() => {
            const updatedTasks = tasks.map(task => {
                if (id === task.id) {
                    return { ...task, name: newName }
                }
                return task;
            });
            setTasks(updatedTasks);
        });
    }

    const taskList = tasks.map(task => (
        <TodoItem
            id={task.id}
            name={task.name}
            completed={task.completed}
            key={task.id}
            completeTask={handleCompleteTask}
            deleteTask={handleDeleteTask}
            editTask={handleEditTask}
        />
    ));

    const listHeadingRef = useRef(null);
    const prevTaskLength = usePrevious(tasks.length);

    useEffect(() => {
        if (tasks.length - prevTaskLength === -1) {
            listHeadingRef.current.focus();
        }
    }, [tasks.length, prevTaskLength]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    
    return (
        <div className="data-area-div">
            <TodoForm addTask={handleAddTask} />
            <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}></h2>
            <ListGroup className="todo-list">
                {taskList}
            </ListGroup>
        </div>
    );
}
