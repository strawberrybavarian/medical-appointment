import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';
const UploadLabResultModal = ({ show, handleClose, patientId, appointmentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    file: null,
  });
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      setFormData({
        ...formData,
        file: null,
      });
    } else {
      setError(null);
      setFormData({
        ...formData,
        file: file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.file) {
      setError('Please upload a PDF file.');
      return;
    }

    const labData = new FormData();
    labData.append('file', formData.file);
    labData.append('testResults', JSON.stringify([]));

    try {
      await axios.post(`${ip.address}/doctor/api/createLaboratoryResult/${patientId}/${appointmentId}`, labData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess(); // To notify parent component after successful upload
      handleClose();
    } catch (err) {
      setError('Failed to upload laboratory result.');
      console.error('Error uploading file:', err.response?.data || err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Upload Laboratory Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="file">
            <Form.Label>Upload Laboratory Result (PDF Only)</Form.Label>
            <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button type="submit" variant="primary" className="mt-3">
            Upload
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UploadLabResultModal;
