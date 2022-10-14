import { useEffect, useState } from 'react';

import { ListView } from '../components/ListView';
import { getTasks } from '../fetch';

export const TodoList = () => {
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
