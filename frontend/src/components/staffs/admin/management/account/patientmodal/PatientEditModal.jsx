import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';


function PatientEditModal({ patient, show, handleClose, handleUpdate }) {
  const [editFormData, setEditFormData] = useState({});
  const [existingEmails, setExistingEmails] = useState([]);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (patient) {
      setEditFormData({
        patient_firstName: patient.patient_firstName || '',
        patient_middleInitial: patient.patient_middleInitial || '',
        patient_lastName: patient.patient_lastName || '',
        patient_email: patient.patient_email || '',
        patient_gender: patient.patient_gender || '',
        // Add other fields as necessary
      });
    }
  }, [patient]);

  useEffect(() => {
    // Fetch all existing emails for validation
    const fetchEmails = async () => {
      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          axios.get(`${ip.address}/api/patient/getallemails`),
          axios.get(`${ip.address}/api/doctors/getallemails`)
        ]);

        const validEmails = [
          ...patientResponse.data,
          ...doctorResponse.data
        ].filter(email => email !== null && email !== patient.patient_email);

        setExistingEmails(validEmails);
      } catch (err) {
        console.error("Error fetching existing emails:", err);
      }
    };

    fetchEmails();
  }, [patient]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });

    // Real-time email validation
    if (name === 'patient_email') {
      if (existingEmails.includes(value)) {
        setEmailError('Email is already in use.');
      } else {
        setEmailError('');
      }
    }
  };

  const handleEditFormSubmit = (e) => {
    e.preventDefault();

    // Check if there is an email error before submitting
    if (emailError) {
      alert('Please fix the errors before submitting.');
      return;
    }

    axios.put(`${ip.address}/api/patient/api/updateinfo/${patient._id}`, editFormData)
      .then(() => {
        handleUpdate(patient._id, editFormData);
        handleClose();
      })
      .catch((error) => {
        console.error('Error updating patient info:', error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Patient Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleEditFormSubmit}>
          <Form.Group controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="patient_firstName"
              value={editFormData.patient_firstName}
              onChange={handleEditFormChange}
            />
          </Form.Group>
          <Form.Group controlId="formMiddleInitial">
            <Form.Label>Middle Initial</Form.Label>
            <Form.Control
              type="text"
              name="patient_middleInitial"
              value={editFormData.patient_middleInitial}
              onChange={handleEditFormChange}
            />
          </Form.Group>
          <Form.Group controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="patient_lastName"
              value={editFormData.patient_lastName}
              onChange={handleEditFormChange}
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="patient_email"
              value={editFormData.patient_email}
              onChange={handleEditFormChange}
              isInvalid={!!emailError}
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formGender">
            <Form.Label>Gender</Form.Label>
            <Form.Control
              as="select"
              name="patient_gender"
              value={editFormData.patient_gender}
              onChange={handleEditFormChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              {/* Add other options if necessary */}
            </Form.Control>
          </Form.Group>
          {/* Add other fields as necessary */}
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!!emailError}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PatientEditModal;
