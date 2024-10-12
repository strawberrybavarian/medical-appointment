import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';


const RescheduleModal = ({ show, handleClose, handleConfirm,  }) => {
  const [rescheduledReason, setRescheduledReason] = useState('');
  const onConfirm = () => {
    handleConfirm(rescheduledReason);
    setRescheduledReason('');
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header className='w-100' closeButton>
        <Modal.Title>Reschedule Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body className='w-100'>
        <Form>
          <Form.Group controlId="formCancelReason">
            <Form.Label>Please state the reason for Rescheduling</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rescheduledReason}
              onChange={(e) => setRescheduledReason(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Reschedule
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RescheduleModal;