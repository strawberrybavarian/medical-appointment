import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const UpdatePatientImageModal = ({ show, handleClose, pid, onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(`http://localhost:8000/patient/api/${pid}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Notify the parent component of the image change
      onImageUpload(response.data.updatedPatient.patient_image);
      handleClose(); // Close the modal
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Profile Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Select a new profile image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Group>
          {selectedFile && (
            <div className="mt-3">
              <h5>Image Preview</h5>
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </div>
          )}
          <Button variant="primary" type="submit" className="mt-3">
            Upload
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdatePatientImageModal;
