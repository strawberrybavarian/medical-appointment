import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';

function MedicalSecretaryDetailsModal({ show, handleClose, msid, handleUpdate }) {
  const [msDetails, setMsDetails] = useState({
    ms_firstName: '',
    ms_lastName: '',
    ms_email: '',
    ms_contactNumber: '',
    ms_image: null
  });
  const [loading, setLoading] = useState(false);
  console.log('msDetails', msDetails);
  // Fetch existing details of the medical secretary
  useEffect(() => {
    if (msid) {
      axios.get(`${ip.address}/api/medicalsecretary/api/findone/${msid}`)
        .then((response) => {
          setMsDetails(response.data.theMedSec);
          console.log('Medical Secretary details:', response.data);
        })
        .catch((error) => {
          console.error('Error fetching Medical Secretary details:', error);
        });
    }
  }, [msid]); // Fetch data when msid changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMsDetails((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setMsDetails((prevState) => ({
      ...prevState,
      ms_image: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('ms_firstName', msDetails.ms_firstName);
    formData.append('ms_lastName', msDetails.ms_lastName);
    formData.append('ms_email', msDetails.ms_email);
    formData.append('ms_contactNumber', msDetails.ms_contactNumber);
    if (msDetails.ms_image) {
      formData.append('image', msDetails.ms_image);
    }

    axios.put(`${ip.address}/api/medicalsecretary/api/${msid}/update`, formData)
      .then((response) => {
        handleUpdate(response.data.medicalSecretary); // Update the staff details in the parent component
        setLoading(false);
        handleClose(); // Close the modal after updating
      })
      .catch((error) => {
        console.error('Error updating Medical Secretary:', error);
        setLoading(false);
      });
  };

  // Only render modal content if msDetails is properly populated
  if (!msDetails.ms_firstName || !msDetails.ms_lastName) {
    return null; // Prevent rendering if msDetails is not properly loaded
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Medical Secretary Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="ms_firstName"
              value={msDetails.ms_firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="ms_lastName"
              value={msDetails.ms_lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="ms_email"
              value={msDetails.ms_email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formContactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              name="ms_contactNumber"
              value={msDetails.ms_contactNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formImage">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
              type="file"
              name="ms_image"
              onChange={handleImageChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Details'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default MedicalSecretaryDetailsModal;
