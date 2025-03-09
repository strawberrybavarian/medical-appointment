import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Swal from 'sweetalert2';
import { ip } from "../../../../ContentExport";

const UpdatePatientInfoModal = ({ show, handleClose, thePatient, pid }) => {
    // Define state variables for patient information
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    
    // Track dirty state and initial values
    const [isDirty, setIsDirty] = useState(false);
    const [initialValues, setInitialValues] = useState({
        firstName: "",
        lastName: "",
        middleInitial: "",
        contactNumber: ""
    });
  
    // Use useEffect to populate the form with the existing patient info when the modal opens
    useEffect(() => {
        if (thePatient) {
            const patientFirstName = thePatient.patient_firstName || "";
            const patientLastName = thePatient.patient_lastName || "";
            const patientMiddleInitial = thePatient.patient_middleInitial || "";
            const patientContactNumber = thePatient.patient_contactNumber || "";
            
            setFirstName(patientFirstName);
            setLastName(patientLastName);
            setMiddleInitial(patientMiddleInitial);
            setContactNumber(patientContactNumber);
            
            // Set initial values for dirty checking
            setInitialValues({
                firstName: patientFirstName,
                lastName: patientLastName,
                middleInitial: patientMiddleInitial,
                contactNumber: patientContactNumber
            });
            
            setIsDirty(false);
        }
    }, [thePatient, show]); // Trigger useEffect when the modal is shown or patient data is passed
    
    // Check for changes in form fields
    useEffect(() => {
        if (show) {
            const hasChanges = 
                firstName !== initialValues.firstName ||
                lastName !== initialValues.lastName ||
                middleInitial !== initialValues.middleInitial ||
                contactNumber !== initialValues.contactNumber;
                
            setIsDirty(hasChanges);
        }
    }, [firstName, lastName, middleInitial, contactNumber, initialValues, show]);

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
                    const response = await axios.put(`${ip.address}/api/patient/api/updateinfo/${pid}`, {
                        patient_firstName: firstName,
                        patient_lastName: lastName,
                        patient_middleInitial: middleInitial,
                        patient_contactNumber: contactNumber,
                    });
                    
                    if (response.data.success) {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Your information has been updated successfully',
                            icon: 'success',
                            confirmButtonColor: '#3085d6'
                        });
                        handleClose(true); // Close modal and indicate success
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: 'Failed to update information',
                            icon: 'error',
                            confirmButtonColor: '#3085d6'
                        });
                    }
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
        <Modal show={show} onHide={handleModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
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
        </Modal>
    );
};

export default UpdatePatientInfoModal;