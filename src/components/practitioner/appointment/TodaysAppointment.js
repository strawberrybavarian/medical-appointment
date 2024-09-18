import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import { Container, Row, Col, Button, Pagination, Form } from 'react-bootstrap';
import './Appointment.css';

const TodaysAppointment = ({ allAppointments }) => {
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Entries per page state
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // Function to update the appointment status
  const updateAppointmentStatus = (appointmentID, newStatus) => {
    axios.put(`http://localhost:8000/appointments/${appointmentID}/status`, { status: newStatus })
      .then(() => {
        // Handle the success response
        window.alert('Appointment status updated to Ongoing');
        window.location.reload(); // Reload the page after updating the status
      })
      .catch(err => {
        console.log(err);
        setError('Failed to update the appointment status.');
      });
  };

  // Filter today's appointments based on today's date
  const todaysAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate === todayDate && appointment.status === 'Scheduled';
  });

  // Filter appointments based on search term
  const filteredAppointments = todaysAppointments.filter(appointment => 
    `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div style={{ padding: '30px', width: '100%' }}>
        <h4 className="mb-4">Today's Appointments</h4>

        {/* Entries per page and search functionality */}
        <Row className="d-flex align-items-center">
          <Col xs={12} md={3} className="mb-3 d-flex align-items-center">
            <div className="d-flex align-items-center w-100">
              <Form.Label className="me-2">Entries per page:</Form.Label>
              <Form.Control
                as="select"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                className="select-dropdown"
                style={{ width: 'auto' }}
              >
                <option value={5}>5</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </Form.Control>
            </div>
          </Col>

          <Col xs={12} md={9} className="mb-3 d-flex align-items-center">
            <div className="d-flex align-items-center w-100">
              <Form.Group controlId="formSearch" className="w-100 d-flex flex-wrap align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="me-2">Search by Patient Name:</Form.Label>
                </Col>
                <Col xs={12} md={8} className="d-flex justify-content-end">
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
              </Form.Group>
            </div>
          </Col>
        </Row>

        <Table striped bordered hover variant="blue">
          <thead>
            <tr>
              <th style={{ border: "1px solid #00000018" }}>Patient Name</th>
              <th style={{ border: "1px solid #00000018" }}>Date</th>
              <th style={{ border: "1px solid #00000018" }}>Time</th>
              <th style={{ border: "1px solid #00000018" }}>Reason</th>
              <th style={{ border: "1px solid #00000018" }}>Status</th>
              <th style={{ border: "1px solid #00000018" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
  {currentAppointments.map(appointment => {
    const patient = appointment.patient;

    // Ensure patient object exists before accessing its properties
    const patientName = patient
      ? `${patient.patient_firstName} ${patient.patient_middleInitial ? patient.patient_middleInitial + "." : ""} ${patient.patient_lastName}`
      : "No Patient Info";  // Fallback if patient is undefined or null

    return (
      <tr key={appointment._id}>
        <td>{patientName}</td>
        <td>{new Date(appointment.date).toLocaleDateString()}</td>
        <td>{appointment.time}</td>
        <td>{appointment.reason}</td>
        <td>{appointment.status}</td>
        <td>
          {/* Ongoing Button */}
          <Button
            variant="success"
            onClick={() => updateAppointmentStatus(appointment._id, 'Ongoing')}
          >
            Ongoing
          </Button>
        </td>
      </tr>
    );
  })}
</tbody>
        </Table>

        {/* Display error if any */}
        {error && <p>{error}</p>}

        {/* Pagination controls */}
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
          {pageNumbers.map(number => (
            <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageNumbers.length))} disabled={currentPage === pageNumbers.length} />
          <Pagination.Last onClick={() => setCurrentPage(pageNumbers.length)} disabled={currentPage === pageNumbers.length} />
        </Pagination>
      </div>
    </>
  );
};

export default TodaysAppointment;
