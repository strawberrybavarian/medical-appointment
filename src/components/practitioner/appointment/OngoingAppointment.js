import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import { Button, Pagination, Form, Row, Col } from 'react-bootstrap';

import './Appointment.css';

const OngoingAppointment = ({ allAppointments }) => {
    const location = useLocation();
  const { did } = location.state || {}; 

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Entries per page state
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  useEffect(() => {
    setAppointments(allAppointments);
  }, [allAppointments]);

  const completeAppointment = (appointmentID) => {
    axios.put(`http://localhost:8000/doctor/api/${appointmentID}/completeappointment`)
      .then((response) => {
        setAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentID ? { ...appointment, status: 'Completed' } : appointment
          )
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // Filter ongoing appointments
  const OngoingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate === todayDate && appointment.status === 'Ongoing';
  });

  // Filter appointments based on search term
  const filteredAppointments = OngoingAppointments.filter(appointment => 
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
        <h4 className="mb-4">Ongoing Appointments</h4>

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
              {/* <th style={{border: "1px solid #00000018"}}>Appointment ID</th> */}
              <th style={{border: "1px solid #00000018"}}>Patient Name</th>
              <th style={{border: "1px solid #00000018"}}>Date</th>
              <th style={{border: "1px solid #00000018"}}>Time</th>
              <th style={{border: "1px solid #00000018"}}>Reason</th>
              <th style={{border: "1px solid #00000018"}}>Status</th>
              <th style={{border: "1px solid #00000018"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map((appointment, index) => {
              const patient = appointment.patient;
              const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
              return (
                <tr key={appointment._id}>
                  {/* <td>{appointment._id}</td> */}
                  <td>{patientName}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <div>
                      <Link to={`/information/${appointment.patient._id}/${did}/${appointment._id}`}>
                        <Button variant="primary">Px Management</Button>
                      </Link>
                      <Button variant="success" onClick={() => completeAppointment(appointment._id)}>Complete</Button>
                    </div>
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

export default OngoingAppointment;
