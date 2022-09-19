import React, { useState, useRef, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { nanoid } from 'nanoid';
import ListGroup from 'react-bootstrap/ListGroup';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
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
    const [tasks, setTasks] = useState(props.todoListData);
    const account = instance.getActiveAccount();

    const handleCompleteTask = (id) => {
        const updatedTask = tasks.find((task) => id === task.id);
        updatedTask.completed = !updatedTask.completed;

        editTask(id, updatedTask)
            .then((response) => {
                if (response && response.error) throw response.error;
                const updatedTasks = tasks.map((task) => {
                    if (id === task.id) {
                        return { ...task, completed: !task.completed };
                    }
                    return task;
                });
                setTasks(updatedTasks);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleAddTask = (name) => {
        const newTask = {
            owner: account.idTokenClaims?.oid,
            id: nanoid(),
            name: name,
            completed: false,
        };

        postTask(newTask)
            .then((response) => {
                if (response && response.error) throw response.error;
                if (response && response.message === 'success') {
                    setTasks([...tasks, newTask]);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleDeleteTask = (id) => {
        deleteTask(id)
            .then((response) => {
                if (response && response.error) throw response.error;
                if (response && response.message === 'success') {
                    const remainingTasks = tasks.filter((task) => id !== task.id);
                    setTasks(remainingTasks);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleEditTask = (id, newName) => {
        const updatedTask = tasks.find((task) => id === task.id);

        updatedTask.name = newName;

        editTask(id, updatedTask)
            .then((response) => {
                if (response && response.error) throw response.error;
                const updatedTasks = tasks.map((task) => {
                    if (id === task.id) {
                        return { ...task, name: newName };
                    }
                    return task;
                });
                setTasks(updatedTasks);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const taskList = tasks.map((task) => (
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
            <ListGroup className="todo-list">{taskList}</ListGroup>
        </div>
    );
};
