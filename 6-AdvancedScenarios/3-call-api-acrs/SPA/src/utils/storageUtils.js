import { deleteTask, postTask, editTask } from '../fetch';

/**
 * This method stores the claim challenge to the localStorage in the browser to be used when acquiring a token
 * @param {String} claimsChallenge
 * @param {String} method
 */
export const addClaimsToStorage = (key, value) => {
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, value)
    }
}

/**
 * This method clears localStorage of any claims challenge entry
 */
export const clearStorage = () => {

    for (var key in localStorage) {
        if (key.startsWith('cc.')) localStorage.removeItem(key);
    }
}

/**
 * This method calls the API if the a access token is fetched
 * @param {Object} options
 * @param {String} id
 */
export const callAPI = (options, id) => {
    switch (options["method"]) {
        case "POST":
            let task = JSON.parse(options.body);
            return postTask(task)
                .then(res => res);
        case "DELETE":
            return deleteTask(id)
                .then(res => res);
        case "PUT":
            let taskItem = JSON.parse(options.body);
            return editTask(id, taskItem)
                .then(res => res)
        default:
            break;
    }
}


