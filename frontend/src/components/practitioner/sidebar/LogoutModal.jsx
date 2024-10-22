import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const LogoutModal = ({ show, onCancel, onConfirm }) => {
    return (
        <Modal show={show} onHide={onCancel} centered className="custom-logout-modal">
            <Modal.Body className="new-modal-content text-center p-4">
                <div className="mb-4 d-flex justify-content-center align-items-center w-100">
                    <div className='icon-background align-items-center'>
                        <i className="fa fa-sign-out-alt color-white" style={{ fontSize: '3rem' }}></i>
                    </div>
                </div>
                <h5 className="mb-3">Already leaving?</h5>
                <p className="mb-4 color-black" style={{fontSize: '12px'}}>Are you sure you want to logout?</p>
                <Button variant="primary" className="w-100 m-0" onClick={onConfirm}>
                    Yes, Logout
                </Button>
                <button className="no-button-background w-100" style={{fontSize: '16px'}} onClick={onCancel}>
                    No, I’m Staying
                </button>
            </Modal.Body>
        </Modal>
    );
};

export default LogoutModal;
