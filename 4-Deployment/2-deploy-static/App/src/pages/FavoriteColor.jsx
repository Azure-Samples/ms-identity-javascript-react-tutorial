import { useEffect, useState } from "react";
import { callOwnApiWithToken } from "../fetch";

export const FavoriteColor = ({ accessToken, endpoint, user, changeFunctionData }) => {

    const [color, setColor] = useState("");

    useEffect(() => {
            if(user && user.favoriteColor) {
                setColor(user.favoriteColor);
            }
    }, [user]);

    const onColorChange = (event) => {
        setColor(event.target.value);
    }

    const updateUserOnServer = async () => {
        const updateUser = await callOwnApiWithToken(accessToken, endpoint, {favoriteColor: color});
        changeFunctionData(updateUser);
    }

    const onFormSubmit = async (event) => {
        event.preventDefault();
        console.log('An color was submitted: ' + color);
        updateUserOnServer().then(response => setUserData(response)).catch(error => console.log(error));
    }

    return (
        <>
            <center>
                <form onSubmit={onFormSubmit}>
                    <input type="text" value={color} onChange={onColorChange} name="favoriteColor" placeholder="fav color?" />
                    <input type="submit" value="Submit" />
                </form>
            </center>
        </>
    );
}
