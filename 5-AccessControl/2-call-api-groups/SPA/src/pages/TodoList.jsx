import { useEffect, useState } from 'react';
import { getTasks } from '../fetch';
import { ListView } from '../components/ListView';


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
         // eslint-disable-next-line
     }, [todoListData]);

    return <>{todoListData ? <ListView todoListData={todoListData} /> : null}</>;
};
