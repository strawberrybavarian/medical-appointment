// File: PatientDetailsModal.js

import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';
import moment from "moment";

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


  //patientDetails.patient_firstName

  return (
    <Modal style={{width:'100%'}} show={show} onHide={handleClose}>
      <Modal.Header style={{width:'100%'}} closeButton>
        <Modal.Title>Patient Details</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{width:'100%'}}>
        {patientDetails ? (
          <div>
            <p><strong>Full Name:</strong> {patientDetails.patient_firstName} {patientDetails.patient_middleInitial ? (patientDetails.patient_middleInitial ,'.') : '.'} {patientDetails.patient_lastName}</p>
            <p><strong>Age:</strong> {moment().diff(moment(patientDetails.patient_dob), 'years')}</p>
            <p><strong>Contact Number:</strong> {patientDetails.patient_contactNumber} </p>
            <p><strong>Email:</strong> {patientDetails.patient_email}</p>
            <p><strong>Gender:</strong> {patientDetails.patient_gender}</p>
            {/* Add other patient details here */}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer style={{width:'100%'}}>
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
