import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge, Alert } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../../../ContentExport";
import Swal from "sweetalert2";

const EditDoctorDetails = ({ show, handleClose, doctorData, handleUpdate }) => {
  const [formData, setFormData] = useState({});
  const [specialties, setSpecialties] = useState([]);
  const [originalStatus, setOriginalStatus] = useState('');
  const [statusChanged, setStatusChanged] = useState(false);

  // Account status options
  const statusOptions = [
    { value: 'Registered', variant: 'success' },
    { value: 'Unregistered', variant: 'warning' },
    { value: 'Deactivated', variant: 'danger' },
    { value: 'Archived', variant: 'dark' }
  ];

  // Update formData when doctorData is received
  useEffect(() => {
    if (doctorData) {
      setFormData(doctorData);
      setOriginalStatus(doctorData.accountStatus || 'Unregistered');
      setStatusChanged(false);
    }
  }, [doctorData]);

  // Fetch specialties from the backend when the modal is opened
  useEffect(() => {
    if (show) {
      fetchSpecialties();
    }
  }, [show]);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${ip.address}/api/find/admin/specialties`);
      if (Array.isArray(response.data)) {
        setSpecialties(response.data);
      } else {
        setSpecialties([]);
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
      setSpecialties([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if status was changed
    if (name === 'accountStatus' && value !== originalStatus) {
      setStatusChanged(true);
    } else if (name === 'accountStatus' && value === originalStatus) {
      setStatusChanged(false);
    }
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Show confirmation if account status is being changed
    if (statusChanged) {
      Swal.fire({
        title: 'Confirm Status Change',
        html: `
          <p>You are about to change the doctor's status from 
          <b>${originalStatus}</b> to <b>${formData.accountStatus}</b></p>
          <p>This may affect the doctor's ability to access the system.</p>
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
    handleUpdate(formData);
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: `Doctor information has been updated successfully.${
        statusChanged ? ' Account status has been changed.' : ''
      }`
    });
  };

  const getBadgeVariant = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.variant : 'secondary';
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} ariaHideApp={false}>
      <Modal.Header closeButton>
        <Modal.Title>Update Doctor Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <h5 className="mb-3">Personal Information</h5>
          
          <Form.Group controlId="firstName" className="mb-3">
            <Form.Label>First Name:</Form.Label>
            <Form.Control
              name="dr_firstName"
              value={formData.dr_firstName || ""}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Row className="mb-3">
            <Form.Group as={Col} controlId="lastName">
              <Form.Label>Last Name:</Form.Label>
              <Form.Control
                name="dr_lastName"
                value={formData.dr_lastName || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="middleInitial">
              <Form.Label>Middle Initial:</Form.Label>
              <Form.Control
                name="dr_middleInitial"
                value={formData.dr_middleInitial || ""}
                onChange={handleChange}
                maxLength={1}
              />
            </Form.Group>
          </Row>
          
          <Row className="mb-3">
            <Form.Group as={Col} controlId="dob">
              <Form.Label>Birthdate:</Form.Label>
              <Form.Control
                type="date"
                name="dr_dob"
                value={formData.dr_dob || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="contactNumber">
              <Form.Label>Contact Number:</Form.Label>
              <Form.Control
                name="dr_contactNumber"
                value={formData.dr_contactNumber || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Form.Group controlId="specialty" className="mb-3">
            <Form.Label>Specialty:</Form.Label>
            <Form.Select
              name="dr_specialty"
              value={formData.dr_specialty || ""}
              onChange={handleChange}
            >
              <option value="">Select a specialty</option>
              {specialties.length > 0 &&
                specialties.map((specialty, index) => (
                  <option key={index} value={specialty.name}>
                    {specialty.name}
                  </option>
                ))}
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
              value={formData.accountStatus || ''}
              onChange={handleChange}
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
                You are changing the account status from <strong>{originalStatus}</strong> to <strong>{formData.accountStatus}</strong>.
                This may affect the doctor's ability to access the system.
              </p>
            </Alert>
          )}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditDoctorDetails;