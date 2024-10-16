// File: PatientDetailsModal.js

import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';

function PatientDetailsModal({ patientId, show, handleClose }) {
  const [patientDetails, setPatientDetails] = useState(null);
    console.log(patientId); 
  useEffect(() => {
    if (patientId && show) {

      axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((response) => {
          
          setPatientDetails(response.data.thePatient);
        })
        .catch((error) => {
          console.error('Error fetching patient details:', error);
        });
    }

    // Clean up when the modal is closed
    return () => {
      setPatientDetails(null);
    };
  }, [patientId, show]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Patient Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {patientDetails ? (
          <div>
            <p><strong>First Name:</strong> {patientDetails.patient_firstName}</p>
            <p><strong>Middle Initial:</strong> {patientDetails.patient_middleInitial}</p>
            <p><strong>Last Name:</strong> {patientDetails.patient_lastName}</p>
            <p><strong>Email:</strong> {patientDetails.patient_email}</p>
            <p><strong>Gender:</strong> {patientDetails.patient_gender}</p>
            {/* Add other patient details here */}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          handleClose();
        }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PatientDetailsModal;
