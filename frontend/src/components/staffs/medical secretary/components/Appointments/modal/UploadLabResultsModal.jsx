import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function UploadLabResultsModal({ show, handleClose, file, handleFileChange, handleSubmit }) {
  return (
    <Modal className="w-100"  show={show} onHide={handleClose}>
      <Modal.Header className="am-header" closeButton>
        <Modal.Title className='d-flex'>Send Laboratory Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Upload Laboratory Result (PDF only)</Form.Label>
            <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
          </Form.Group>

          {file && (
            <div className="mt-3 w-100">
              <p>Preview of the uploaded PDF:</p>
              <embed src={URL.createObjectURL(file)} type="application/pdf" width="100%" height="400px" />
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Send Laboratory
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UploadLabResultsModal;
