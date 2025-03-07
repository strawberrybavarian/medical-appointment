import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import Swal from 'sweetalert2';
import { ip } from "../../../../ContentExport";
import { Person } from 'react-bootstrap-icons';

const UpdateInfoModal = ({ show, handleClose, doctorData, handleUpdate }) => {
  // Define state variables for doctor information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [dob, setDob] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [specialties, setSpecialties] = useState([]);
  
  // Track dirty state and initial values
  const [isDirty, setIsDirty] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    contactNumber: "",
    dob: "",
    specialty: ""
  });

  // Fetch specialties from the backend when the modal is opened
  useEffect(() => {
    if (show) {
      fetchSpecialties();
    }
  }, [show]);

  // Use useEffect to populate the form with existing doctor info when the modal opens
  useEffect(() => {
    if (doctorData && show) {
      const doctorFirstName = doctorData.theName || "";
      const doctorLastName = doctorData.theLastName || "";
      const doctorMiddleInitial = doctorData.theMI || "";
      const doctorContactNumber = doctorData.cnumber || "";
      const doctorDob = doctorData.dob ? new Date(doctorData.dob).toISOString().split("T")[0] : "";
      const doctorSpecialty = doctorData.specialty || "";
      
      setFirstName(doctorFirstName);
      setLastName(doctorLastName);
      setMiddleInitial(doctorMiddleInitial);
      setContactNumber(doctorContactNumber);
      setDob(doctorDob);
      setSpecialty(doctorSpecialty);
      
      // Set initial values for dirty checking
      setInitialValues({
        firstName: doctorFirstName,
        lastName: doctorLastName,
        middleInitial: doctorMiddleInitial,
        contactNumber: doctorContactNumber,
        dob: doctorDob,
        specialty: doctorSpecialty
      });
      
      setIsDirty(false);
    }
  }, [doctorData, show]);
  
  // Check for changes in form fields
  useEffect(() => {
    if (show) {
      const hasChanges = 
        firstName !== initialValues.firstName ||
        lastName !== initialValues.lastName ||
        middleInitial !== initialValues.middleInitial ||
        contactNumber !== initialValues.contactNumber ||
        dob !== initialValues.dob ||
        specialty !== initialValues.specialty;
          
      setIsDirty(hasChanges);
    }
  }, [firstName, lastName, middleInitial, contactNumber, dob, specialty, initialValues, show]);

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

  // Validate form before submission
  const validateForm = () => {
    if (!firstName.trim()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'First name cannot be empty',
        icon: 'error'
      });
      return false;
    }
    
    if (!lastName.trim()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Last name cannot be empty',
        icon: 'error'
      });
      return false;
    }
    
    // Optional: Add contact number validation
    if (contactNumber && !/^\d{10,11}$/.test(contactNumber.replace(/[^0-9]/g, ''))) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please enter a valid contact number (10-11 digits)',
        icon: 'error'
      });
      return false;
    }
    
    // Validate date of birth if provided
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime()) || birthDate > today || age > 100) {
        Swal.fire({
          title: 'Validation Error',
          text: 'Please enter a valid date of birth',
          icon: 'error'
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSaveChanges = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    // Show confirmation dialog
    Swal.fire({
      title: 'Confirm Changes',
      text: 'Are you sure you want to update your information?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Create the update object with proper field names
          const updateData = {
            dr_firstName: firstName,
            dr_lastName: lastName,
            dr_middleInitial: middleInitial,
            dr_contactNumber: contactNumber,
            dr_dob: dob,
            dr_specialty: specialty
          };
          
          // Call the parent component's update function
          await handleUpdate(updateData);
          
          Swal.fire({
            title: 'Success!',
            text: 'Your information has been updated successfully',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
          
          handleClose(true); // Close modal and indicate success
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while updating information',
            icon: 'error',
            confirmButtonColor: '#3085d6'
          });
        }
      }
    });
  };
  
  const handleModalClose = () => {
    if (isDirty) {
      // Show confirmation dialog if there are unsaved changes
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, discard changes',
        cancelButtonText: 'No, keep editing'
      }).then((result) => {
        if (result.isConfirmed) {
          handleClose(false); // Close the modal without saving
        }
      });
    } else {
      handleClose(false); // No changes, close directly
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      backdrop="static"
      keyboard={false}
      centered
      className="update-info-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <Person className="me-2" /> 
          Update Doctor Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  isInvalid={firstName.trim() === ""}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  First name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Last Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  isInvalid={lastName.trim() === ""}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Last name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="middleInitial">
                <Form.Label>Middle Initial:</Form.Label>
                <Form.Control
                  type="text"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  maxLength={1}
                />
                <Form.Text className="text-muted">
                  Single letter only
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="contactNumber">
                <Form.Label>Contact Number:</Form.Label>
                <Form.Control
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter your contact number"
                />
                <Form.Text className="text-muted">
                  Format: 10-11 digits
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="dob">
                <Form.Label>Date of Birth:</Form.Label>
                <Form.Control
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="specialty">
                <Form.Label>Specialty:</Form.Label>
                <Form.Select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="">Select a specialty</option>
                  {specialties.length > 0 &&
                    specialties.map((specialty, index) => (
                      <option key={index} value={specialty.name || specialty}>
                        {specialty.name || specialty}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSaveChanges}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </Modal.Footer>

      <style jsx>{`
        .update-info-modal .modal-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .update-info-modal .modal-title {
          display: flex;
          align-items: center;
          color: #2c3e50;
          font-weight: 600;
        }
        
        .update-info-modal .modal-footer {
          border-top: 1px solid #e9ecef;
          padding: 1rem;
        }
        
        .update-info-modal .form-label {
          font-weight: 500;
          color: #495057;
        }
        
        .update-info-modal .form-control:focus,
        .update-info-modal .form-select:focus {
          border-color: #4a90e2;
          box-shadow: 0 0 0 0.25rem rgba(74, 144, 226, 0.25);
        }
        
        .update-info-modal .btn-primary {
          background-color: #4a90e2;
          border-color: #4a90e2;
        }
        
        .update-info-modal .btn-primary:hover:not(:disabled) {
          background-color: #3a7bc8;
          border-color: #3a7bc8;
        }
        
        .update-info-modal .btn-primary:disabled {
          background-color: #a9c7ea;
          border-color: #a9c7ea;
        }
      `}</style>
    </Modal>
  );
};

export default UpdateInfoModal;