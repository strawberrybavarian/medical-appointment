import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './CancelModal.css';

const CancelModal = ({ show, handleClose, handleConfirm }) => {
  const [cancelReason, setCancelReason] = useState('');

  const onConfirm = () => {
    handleConfirm(cancelReason);
    setCancelReason('');
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Cancel Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formCancelReason">
            <Form.Label>Please state the reason for cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Cancellation
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancelModal;
