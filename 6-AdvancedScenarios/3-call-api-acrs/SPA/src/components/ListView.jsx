import React, { useState, useRef, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { nanoid } from "nanoid";
import ListGroup from "react-bootstrap/ListGroup";

import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

import { deleteTask, postTask, editTask } from '../fetch';

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
    const [tasks, setTasks] = useState(props.todoListData);

    const handleCompleteTask = (id) => {
        const updatedTask = tasks.find(task => id === task.id);
        updatedTask.completed = !updatedTask.completed;

        editTask(id, updatedTask).then((response) => {
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
            owner: account.username,
            id: nanoid(),
            name: name,
            completed: false
        };

        postTask(newTask).then((res) => {
            if(res && res.message === "success"){
                setTasks([...tasks, newTask]);
            }   
        })
    }

    const handleDeleteTask = (id) => {
        deleteTask(id).then((response) => {
            if (response && response.message === "success") {
                const remainingTasks = tasks.filter(task => id !== task.id);
                setTasks(remainingTasks);
            }
        });
    }

    const handleEditTask = (id, newName) => {
        const updatedTask = tasks.find(task => id === task.id);
        updatedTask.name = newName;

        editTask(id, updatedTask).then(() => {
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