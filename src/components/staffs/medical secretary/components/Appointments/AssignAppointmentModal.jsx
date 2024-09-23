import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AssignAppointmentModal = ({ show, handleClose, alldoctors, selectedDoctor, setSelectedDoctor, selectedDate, setSelectedDate, selectedTime, setSelectedTime, handleSaveDetails, error }) => {
  
  // Function to convert time to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24) => {
    const [hour, minute] = time24.split(':');
    const period = +hour < 12 ? 'AM' : 'PM';
    const hour12 = +hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  const handleTimeChange = (e) => {
    const time24 = e.target.value;
    const time12 = convertTo12HourFormat(time24);
    setSelectedTime(time12); // Save in 12-hour format
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Appointment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Form.Group controlId="formAssignDoctor">
          <Form.Label>Assign Doctor</Form.Label>
          <Form.Control
            as="select"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">Select Doctor</option>
            {alldoctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {`${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formAssignDate">
          <Form.Label>Assign Date</Form.Label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formAssignTime">
          <Form.Label>Assign Time (AM/PM)</Form.Label>
          <Form.Control
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveDetails}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignAppointmentModal;
