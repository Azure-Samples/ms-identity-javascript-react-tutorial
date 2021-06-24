import { useEffect, useState } from "react";
import { callOwnApiWithToken } from "../fetch";

export const FavoriteColor = ({ accessToken, endpoint, user, changeFunctionData }) => {

    const [userData, setUserData] = useState({ name: null, email: null, favoriteColor: null });

    useEffect(() => {
            if(user) {
                setUserData(user);
            }
    }, [user]);

    const onColorChange = (event) => {
        setUserData({
            ...userData,
            favoriteColor: event.target.value
        });
    }

    const updateUserOnServer = async () => {
        const updateUser = await callOwnApiWithToken(accessToken, endpoint, userData);
        changeFunctionData(updateUser);
    }

    const onFormSubmit = async (event) => {
        event.preventDefault();
        console.log('An color was submitted: ' + userData.favoriteColor);
        updateUserOnServer().then(response => setUserData(response)).catch(error => console.log(error));
    }

    return (
        <>
            <center>
                <form onSubmit={onFormSubmit}>
                    <input type="text" value={userData.favoriteColor} onChange={onColorChange} name="favoriteColor" placeholder="fav color?" />
                    <input type="submit" value="Submit" />
                </form>
            </center>
        </>
    );

}
