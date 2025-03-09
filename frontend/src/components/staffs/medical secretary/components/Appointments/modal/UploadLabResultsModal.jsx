import React from 'react';
import { Modal, Button, Form, Container } from 'react-bootstrap';

function UploadLabResultsModal({ show, handleClose, file, handleFileChange, handleSubmit }) {
  return (
    <Modal size='lg' className="w-100 modal-inside-container"  show={show} onHide={handleClose}>
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
            <Container fluid className="mt-3 w-100">
              <p>Preview of the uploaded PDF:</p>
              <embed src={URL.createObjectURL(file)} type="application/pdf" width="100%" height="400px" />
            </Container>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className='d-flex w-100'>
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
