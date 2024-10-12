// InexactAmountModal.js
import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function InexactAmountModal({ show, handleClose, handleSubmit, inexactAmount, setInexactAmount }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Enter Inexact Amount</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Inexact Amount</Form.Label>
            <Form.Control
              type="number"
              value={inexactAmount}
              onChange={(e) => setInexactAmount(e.target.value)} // Update state on input change
            />
          </Form.Group>
        </Form>
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
}

export default InexactAmountModal;
