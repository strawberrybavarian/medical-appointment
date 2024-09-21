import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Table, Container, Pagination, Form, Row, Col } from 'react-bootstrap';
import './Styles.css';

function MedSecOngoing({ allAppointments, setAllAppointments }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [alldoctors, setalldoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/alldoctor`)
      .then((result) => {
        setalldoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const ongoingAppointment = (appointmentID) => {
    const newStatus = { status: 'Ongoing' };
    axios.put(`http://localhost:8000/medicalsecretary/api/${appointmentID}/ongoing`, newStatus)
      .then((response) => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentID ? { ...appointment, status: 'Ongoing' } : appointment
          )
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const filteredAppointments = allAppointments
    .filter(appointment => appointment.status === 'Ongoing')
    .filter(appointment => 
      `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    )
    .filter(appointment => selectedDoctor === "" || appointment.doctor?._id === selectedDoctor)
    .filter(appointment => selectedAccountStatus === "" || appointment.patient.accountStatus === selectedAccountStatus);

  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Container>
        <div style={{ padding: '30px', width: '100%' }}>
          <h1>Ongoing Appointments</h1>
          <Container className="p-0">
            <Row className="g-3"> {/* Use gutter spacing to control the space between columns */}
              <Col lg={4} md={6} sm={12}>
                <Form.Group controlId="formDoctorSearch" className="d-flex align-items-center">
                  <Form.Label style={{ marginRight: '1vh' }}>Doctor:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Doctors</option>
                    {alldoctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {`${doctor?.dr_firstName} ${doctor?.dr_middleInitial}. ${doctor?.dr_lastName}`}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={12} className="p-0">
                <Form.Group controlId="formSearch" className="d-flex align-items-center">
                  <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Patient:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </Form.Group>
              </Col>

              <Col lg={3} md={5} sm={12} className="p-0">
                <Form.Group controlId="formAccountStatus" className="d-flex align-items-center">
                  <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Status:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedAccountStatus}
                    onChange={(e) => setSelectedAccountStatus(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Account Statuses</option>
                    <option value="Registered">Registered</option>
                    <option value="Unregistered">Unregistered</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </Container>

          <Table striped bordered hover variant="light">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Doctor Name</th>
                <th>Service</th> 
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;

                // Check if doctor exists before rendering
                const doctor = appointment.doctor;
                const doctorName = doctor 
                  ? `${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}` 
                  : 'No Doctor Assigned';

                const appointmentTypes = appointment.appointment_type.join(', ');
                return (
                  <tr key={appointment._id}>
                    <td>{patientName}</td>
                    <td>{doctorName}</td> {/* Handle missing doctor */}
                    <td>{appointmentTypes}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.status}</td>
                    <td>
                      {/* Actions can be added here */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Container className="d-flex justify-content-between p-0">
            <div style={{ height: '40%', width: '40%' }} className="d-flex p-0 align-content-center">
              <div style={{ height: '60%', width: '60%' }}>
                <label>Entries per page:</label>
              </div>
              <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}>
                <option value={5}>5</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

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
          </Container>
        </div>
      </Container>
    </>
  );
}

export default MedSecOngoing;
