import { Modal, ListGroup } from "react-bootstrap";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { BsPersonPlus, BsPersonCircle } from "react-icons/bs";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { IconContext } from "react-icons";

export const AccountPicker = (props) => {
    const { instance, accounts } = useMsal();

    const handleListItemClick = (account) => {
        const activeAccount = instance.getActiveAccount();
        if(!account){
            instance.setActiveAccount(account);
            instance.loginRedirect({
                ...loginRequest,
                prompt: "login"
            });
        } else if(account && activeAccount.homeAccountId != account.homeAccountId){
          const { idTokenClaims } = account;
          instance.setActiveAccount(account);
          instance
            .ssoSilent({
              scopes: loginRequest.scopes,
              login_hint: idTokenClaims.login_hint,
            }).catch((error) => {
              if(error instanceof InteractionRequiredAuthError){
                 instance.loginRedirect({
                   ...loginRequest,
                   prompt: "login",
                 });
              }
            });
        }
    }

  return (
    <>
      <Modal show={props.show} onHide={props.handleSwitchAccount}>
        <Modal.Header closeButton>
          <Modal.Title>Set active account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup as="ul">
            {accounts.map((account) => (
              <ListGroup.Item
                as="li"
                active={
                  instance.getActiveAccount().localAccountId ===
                  account.localAccountId ? true : false
                }
                key={account.homeAccountId}
                onClick={() => handleListItemClick(account)}
                style={{ flexDirection: "row", display: "flex" }}
                className="flex-row align-items-start"
              >
                <IconContext.Provider value={{ size: "1.5rem" }}>
                  <BsPersonCircle />
                </IconContext.Provider>
                <p style={{ margin: "0 .5rem" }}>{account.name}</p>
              </ListGroup.Item>
            ))}
            <ListGroup.Item
              className="flex-row align-items-start"
              style={{ flexDirection: "row", display: "flex" }}
              as="li"
              onClick={() => handleListItemClick(null)}
            >
              <IconContext.Provider value={{ size: "1.5rem" }}>
                <BsPersonPlus />
              </IconContext.Provider>
              <p style={{ margin: "0 .5rem" }}>New Account</p>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
};
