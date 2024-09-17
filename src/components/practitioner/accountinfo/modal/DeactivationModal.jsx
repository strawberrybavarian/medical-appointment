import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DeactivationModal = ({ show, handleClose, handleConfirm }) => {
    const [reason, setReason] = useState('');

    const handleReasonChange = (e) => {
        setReason(e.target.value);
    };

    const handleSubmit = () => {
        if (reason.trim()) {
            handleConfirm(reason);
            setReason(''); // Clear the reason after submission
        } else {
            alert('Please provide a reason for deactivating the appointments.');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Deactivate Appointments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="deactivationReason">
                    <Form.Label>Please provide a reason for deactivating the appointments:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={reason}
                        onChange={handleReasonChange}
                        placeholder="Enter reason here..."
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeactivationModal;
