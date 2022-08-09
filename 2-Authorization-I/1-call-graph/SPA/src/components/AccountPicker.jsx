import { Modal, ListGroup } from 'react-bootstrap';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { IconContext } from 'react-icons';
import { BsPersonPlus, BsPersonCircle } from 'react-icons/bs';

import { loginRequest } from '../authConfig';

export const AccountPicker = (props) => {
    const { instance, accounts } = useMsal();

    const handleListItemClick = async (account) => {
        const activeAccount = instance.getActiveAccount();
        if (!account) {
            instance.setActiveAccount(account);
            instance.loginRedirect({
                ...loginRequest,
                prompt: 'login',
            });
        } else if (account && activeAccount.homeAccountId != account.homeAccountId) {
            instance.setActiveAccount(account);
            try {
                await instance.ssoSilent({
                    ...loginRequest,
                    account: account,
                });

                props.handleSwitchAccount(false);

                // To ensure account related page attributes update after the account is changed
                window.location.reload();
            } catch (error) {
                if (error instanceof InteractionRequiredAuthError) {
                    instance.loginRedirect({
                        ...loginRequest,
                        prompt: 'login',
                    });
                }
            }
        } else {
            props.handleSwitchAccount(false);
        }
    };

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
                                role="button"
                                active={
                                    instance.getActiveAccount()?.localAccountId === account.localAccountId
                                        ? true
                                        : false
                                }
                                key={account.homeAccountId}
                                onClick={() => handleListItemClick(account)}
                                className="d-flex flex-row align-items-start"
                            >
                                <IconContext.Provider value={{ size: '1.5rem' }}>
                                    <BsPersonCircle />
                                </IconContext.Provider>
                                <p className="iconText">{account.name}</p>
                            </ListGroup.Item>
                        ))}
                        <ListGroup.Item
                            className="d-flex flex-row align-items-start"
                            as="li"
                            role="button"
                            onClick={() => handleListItemClick(null)}
                        >
                            <IconContext.Provider value={{ size: '1.5rem' }}>
                                <BsPersonPlus />
                            </IconContext.Provider>
                            <p className="iconText">New Account</p>
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </>
    );
};
