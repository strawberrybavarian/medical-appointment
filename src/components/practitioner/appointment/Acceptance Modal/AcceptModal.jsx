// AcceptModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function AcceptModal({ show, handleClose, handleConfirm }) {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Accept Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to accept this appointment?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Accept
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AcceptModal;
