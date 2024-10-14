// src/components/PrescriptionPatientModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PrescriptionPatientModal = ({ show, handleClose, appointment }) => {
    console.log(appointment);
    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Prescription List RX</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {appointment?.prescription ? (
                    <>
                        <h5>Doctor: Dr. {appointment.prescription.doctor.dr_firstName} {appointment.prescription.doctor.dr_middleInitial}. {appointment.prescription.doctor.dr_lastName}</h5>
                        <h6>Date of Consultation: {new Date(appointment.prescription.createdAt).toLocaleDateString()}</h6>
                        <h6>Medications:</h6>
                        <ul>
                            {appointment.prescription.medications.map((med, index) => (
                                <li key={index}>
                                    <p>Name: {med.name}</p>
                                    <p>Type: {med.type}</p>
                                    <p>Instruction: {med.instruction}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>No prescription found for this appointment.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrescriptionPatientModal;
