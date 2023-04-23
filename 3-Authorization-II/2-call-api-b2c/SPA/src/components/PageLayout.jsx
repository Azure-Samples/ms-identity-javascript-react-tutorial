import { AuthenticatedTemplate } from "@azure/msal-react";
import { NavigationBar } from "./NavigationBar";

export const PageLayout = (props) => {
    return (
        <>
            <NavigationBar />
            <br />
            <h5>
                <center>Welcome to the Microsoft Authentication Library For React Tutorial</center>
            </h5>
            <br />
            {props.children}
            <br />
        </>
    );
}