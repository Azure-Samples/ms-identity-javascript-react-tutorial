

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


