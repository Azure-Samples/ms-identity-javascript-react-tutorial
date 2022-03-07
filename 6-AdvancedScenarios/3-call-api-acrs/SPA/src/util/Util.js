import  { msalConfig } from '../authConfig';

export const addClaimsToStorage = (claimsChallenge, method) => {
    if(msalConfig.cache.cacheLocation === "localStorage"){
        if(!localStorage.getItem(method)){
            localStorage.setItem(method, claimsChallenge)
        }
    }else if(msalConfig.cache.cacheLocation === "sessionStorage"){
        if(!sessionStorage.getItem(method)){
            sessionStorage.setItem(method, claimsChallenge)
        }
    }
}   

export const clearStorage = () => {
    if(msalConfig.cache.cacheLocation === "localStorage"){
        localStorage.removeItem("POST");
        localStorage.removeItem("DELETE");
        localStorage.removeItem("PUT");
    }else if(msalConfig.cache.cacheLocation === "sessionStorage"){
        sessionStorage.removeItem("POST");
        sessionStorage.removeItem("DELETE");
        sessionStorage.removeItem("PUT");   
    }
}