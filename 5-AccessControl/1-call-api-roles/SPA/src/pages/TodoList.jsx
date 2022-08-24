import { useEffect, useState } from 'react';
import { getTasks } from '../fetch';
import { ListView } from '../components/ListView';

const TodoListContent = () => {
    const [todoListData, setTodoListData] = useState(null);

    useEffect(() => {
        if (!todoListData) {
            getTasks()
                .then((response) => {
                    if (response && response.error) throw response.error;
                    setTodoListData(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [todoListData]);

    return <>{todoListData ? <ListView todoListData={todoListData} /> : null}</>;
};

export const TodoList = () => {
    return <TodoListContent />;
};
