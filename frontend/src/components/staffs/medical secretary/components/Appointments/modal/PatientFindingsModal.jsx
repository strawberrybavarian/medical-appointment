import React from 'react';
import { Modal } from 'react-bootstrap';
import PatientFindings from '../../../../../practitioner/patientinformation/findings/PatientFindings';


function PatientFindingsModal({ show, handleClose, appointment }) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl" // Set size as needed
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Patient Findings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <PatientFindings
          patientId={appointment.patient._id}
          appointmentId={appointment._id}
          doctorId={appointment.doctor?._id}
        />
      </Modal.Body>
    </Modal>
  );
}

export default PatientFindingsModal;
