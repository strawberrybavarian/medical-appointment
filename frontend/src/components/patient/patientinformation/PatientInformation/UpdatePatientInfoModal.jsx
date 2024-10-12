import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../ContentExport";
const UpdatePatientInfoModal = ({ show, handleClose, thePatient, pid }) => {
    // Define state variables for patient information
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [contactNumber, setContactNumber] = useState("");

    // Use useEffect to populate the form with the existing patient info when the modal opens
    useEffect(() => {
        if (thePatient) {
            setFirstName(thePatient.patient_firstName || "");
            setLastName(thePatient.patient_lastName || "");
            setMiddleInitial(thePatient.patient_middleInitial || "");
            setContactNumber(thePatient.patient_contactNumber || "");
        }
    }, [thePatient, show]); // Trigger useEffect when the modal is shown or patient data is passed

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(`${ip.address}/patient/api/updateinfo/${pid}`, {
                patient_firstName: firstName,
                patient_lastName: lastName,
                patient_middleInitial: middleInitial,
                patient_contactNumber: contactNumber,
            });

            if (response.data.success) {
                alert("Information updated successfully!");
                handleClose(); // Close modal after successful update
            } else {
                alert("Failed to update information.");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating information.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="firstName">
                        <Form.Label>First Name:</Form.Label>
                        <Form.Control
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="lastName">
                        <Form.Label>Last Name:</Form.Label>
                        <Form.Control
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="middleInitial">
                        <Form.Label>Middle Initial:</Form.Label>
                        <Form.Control
                            type="text"
                            value={middleInitial}
                            onChange={(e) => setMiddleInitial(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="contactNumber">
                        <Form.Label>Contact Number:</Form.Label>
                        <Form.Control
                            type="text"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UpdatePatientInfoModal;
