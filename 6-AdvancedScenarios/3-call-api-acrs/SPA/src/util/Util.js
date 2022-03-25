import { deleteTask, postTask, editTask } from '../fetch';

/**
 *  This method stores the claim challenge to the localStorage in the browser to be used when acquiring a token
 * @param {String} claimsChallenge 
 * @param {String} method 
 */
export const addClaimsToStorage = (claimsChallenge, method) => {

    if(!localStorage.getItem(method)){
        localStorage.setItem(method, claimsChallenge)
    }

}   


/**
 * This method clears localStorage if claim challenge based on operation (POST, DELETE, PUT)
 */
export const clearStorage = () => {

    localStorage.removeItem("POST");
    localStorage.removeItem("DELETE");
    localStorage.removeItem("PUT");  
}

/**
 * This method calls the API if the new access token is fetched 
 * @param {Object} options 
 * @param {String} id 
 * @returns response from API
 */
export const callAPI = (options, id) => {
    switch(options["method"]){
        case "POST":
            let task =  JSON.parse(options.body);
            return postTask(task)
                    .then(res => res);
        case "DELETE":
            return deleteTask(id)
                    .then(res => res);  
        case "PUT":
            let taskItem =  JSON.parse(options.body);
            return editTask(id, taskItem)
                    .then(res => res)
        default:
            break;
    }
} 


