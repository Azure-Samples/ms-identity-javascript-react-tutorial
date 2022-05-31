import React from "react";
import { Nav, Navbar, Button } from "react-bootstrap";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { callApiToLogin, callApiToLogout } from "../fetch";

export const NavigationBar = () => {
  const { instance } = useMsal();

  /**
   * This method sends a request to the back-end to sign in the use and if it's successful, it will send back SPA auth code to the front-end
   */
  const handelLogin = () => {
    callApiToLogin().then((data) => {
      window.open(data, "_self");
    });
  };

  /**
   *  This method sends a request to sign out the user in the back-end, and if successful, it will sign out the user in the front-end
   */
  const handleLogout = () => {
    callApiToLogout()
      .then((data) => {
        if (data && data.message === "success") {
          instance.logoutRedirect({ postLogoutRedirectUri: "/" });
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <a className="navbar-brand" href="/">
          Microsoft identity platform
        </a>
        <AuthenticatedTemplate>
          <Nav.Link as={Button} href="/profile">
            Profile
          </Nav.Link>

          <Button
            variant="warning"
            className="ml-auto"
            drop="left"
            as="button"
            onClick={handleLogout}
          >
            {" "}
            Sign out{" "}
          </Button>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Button
            variant="secondary"
            className="ml-auto"
            drop="left"
            as="button"
            onClick={handelLogin}
          >
            Sign in
          </Button>
        </UnauthenticatedTemplate>
      </Navbar>
    </>
  );
};
