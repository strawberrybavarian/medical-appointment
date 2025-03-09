import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';
import Swal from 'sweetalert2';

function PatientEditModal({ patient, show, handleClose, handleUpdate }) {
  const [editFormData, setEditFormData] = useState({});
  const [existingEmails, setExistingEmails] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [originalStatus, setOriginalStatus] = useState('');
  const [statusChanged, setStatusChanged] = useState(false);

  // Account status options
  const statusOptions = [
    { value: 'Registered', variant: 'success' },
    { value: 'Unregistered', variant: 'warning' },
    { value: 'Deactivated', variant: 'danger' },
    { value: 'Archived', variant: 'dark' }
  ];

  useEffect(() => {
    if (patient) {
      setEditFormData({
        patient_firstName: patient.patient_firstName || '',
        patient_middleInitial: patient.patient_middleInitial || '',
        patient_lastName: patient.patient_lastName || '',
        patient_email: patient.patient_email || '',
        patient_gender: patient.patient_gender || '',
        accountStatus: patient.accountStatus || 'Unregistered',
      });
      setOriginalStatus(patient.accountStatus || 'Unregistered');
      setStatusChanged(false);
    }
  }, [patient]);

  useEffect(() => {
    // Fetch all existing emails for validation
    const fetchEmails = async () => {
      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          axios.get(`${ip.address}/api/patient/getallemails`),
          axios.get(`${ip.address}/api/doctor/getallemails`)
        ]);

        const validEmails = [
          ...patientResponse.data,
          ...doctorResponse.data
        ].filter(email => email !== null && email !== patient?.patient_email);

        setExistingEmails(validEmails);
      } catch (err) {
        console.error("Error fetching existing emails:", err);
      }
    };

    if (patient) {
      fetchEmails();
    }
  }, [patient]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // Check if status was changed
    if (name === 'accountStatus' && value !== originalStatus) {
      setStatusChanged(true);
    } else if (name === 'accountStatus' && value === originalStatus) {
      setStatusChanged(false);
    }
    
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
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors before submitting.'
      });
      return;
    }

    // Show confirmation if account status is being changed
    if (statusChanged) {
      Swal.fire({
        title: 'Confirm Status Change',
        html: `
          <p>You are about to change the patient's status from 
          <b>${originalStatus}</b> to <b>${editFormData.accountStatus}</b></p>
          <p>This may affect the patient's ability to access the system.</p>
          <p>Do you want to proceed?</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it!'
      }).then((result) => {
        if (result.isConfirmed) {
          submitFormData();
        }
      });
    } else {
      // If status wasn't changed, just submit the form
      submitFormData();
    }
  };

  const submitFormData = () => {
    axios.put(`${ip.address}/api/patient/api/updateinfo/${patient._id}`, editFormData)
      .then(() => {
        handleUpdate(patient._id, editFormData);
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Patient information has been updated successfully.${
            statusChanged ? ' Account status has been changed.' : ''
          }`
        });
        
        handleClose();
      })
      .catch((error) => {
        console.error('Error updating patient info:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'There was an error updating the patient information.'
        });
      });
  };

  const getBadgeVariant = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.variant : 'secondary';
  };

  return (
    <Modal size="lg" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Patient Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleEditFormSubmit}>
          {/* Personal Information Section */}
          <h5 className="mb-3">Personal Information</h5>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formFirstName" className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="patient_firstName"
                  value={editFormData.patient_firstName || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formLastName" className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="patient_lastName"
                  value={editFormData.patient_lastName || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="formMiddleInitial" className="mb-3">
            <Form.Label>Middle Initial</Form.Label>
            <Form.Control
              type="text"
              name="patient_middleInitial"
              value={editFormData.patient_middleInitial || ''}
              onChange={handleEditFormChange}
              maxLength={1}
            />
          </Form.Group>
          
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="patient_email"
              value={editFormData.patient_email || ''}
              onChange={handleEditFormChange}
              isInvalid={!!emailError}
              required
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId="formGender" className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="patient_gender"
              value={editFormData.patient_gender || ''}
              onChange={handleEditFormChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          {/* Account Status Section */}
          <hr />
          <h5 className="mb-3">Account Settings</h5>

          <Form.Group controlId="formAccountStatus" className="mb-3">
            <Form.Label>Account Status</Form.Label>
            <div className="mb-2">
              <span>Current Status: </span>
              <Badge bg={getBadgeVariant(originalStatus)} className="ms-1">
                {originalStatus}
              </Badge>
            </div>
            <Form.Select
              name="accountStatus"
              value={editFormData.accountStatus || ''}
              onChange={handleEditFormChange}
              required
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          {statusChanged && (
            <Alert variant="warning">
              <Alert.Heading className="h6">Status Change Warning</Alert.Heading>
              <p className="mb-0">
                You are changing the account status from <strong>{originalStatus}</strong> to <strong>{editFormData.accountStatus}</strong>.
                This may affect the patient's ability to access the system.
              </p>
            </Alert>
          )}

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