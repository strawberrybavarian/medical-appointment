import { useEffect, useState } from "react";
import Table from 'react-bootstrap/Table';
import { Pagination, Form, Container, Row, Col } from 'react-bootstrap';
import './Appointment.css';
import RescheduleModal from "./Reschedule Modal/RescheduleModal"; 
import axios from "axios";

const UpcomingAppointment = ({ allAppointments, setAllAppointments }) => {
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Get today's date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  

  // Filter upcoming appointments
  const upcomingAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate > todayDate && appointment.status === 'Scheduled';
  });

  // Filter based on search term
  const filteredAppointments = upcomingAppointments.filter(appointment =>
    (`${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  // Function to handle showing reschedule modal
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  
  const handleConfirmReschedule = (rescheduledReason) => {
    const newStatus = {
      rescheduledReason: rescheduledReason,
      status: 'Rescheduled'
    };
    axios.put(`http://localhost:8000/doctor/${selectedAppointment._id}/rescheduledstatus`, newStatus)
      .then(() => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === selectedAppointment._id ? { ...appointment, status: 'Rescheduled', rescheduledReason: rescheduledReason } : appointment
          )
        );
        setCurrentPage(1); 
        setShowRescheduleModal(false);  // Close modal after reschedule
      })
      .catch((err) => {
        console.log(err);
      });
  };

  

  return (
    <div>
      <div style={{ padding: '30px', width: '100%' }}>
        <h4 className="mb-4">Upcoming Appointments</h4>

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

        <Table responsive striped  variant="light" className="mt-3">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map((appointment) => {
              const patient = appointment.patient || {}; // Ensure patient is an object
              const patientName = `${patient.patient_firstName || ''} ${patient.patient_middleInitial || ''}. ${patient.patient_lastName || ''}`.trim();
              
              return (
                <tr key={appointment._id}>
                  <td>{patientName}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <div className="scheduled-appointment">
                        {appointment.status}
                      </div>
                    </div>


                  </td>
                  <td>
                    <span 
                      onClick={() => handleReschedule(appointment)} 
                      style={{ cursor: 'pointer', color: 'orange', textDecoration: 'underline' }}
                    >
                      Reschedule
                    </span>
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

      {/* Reschedule Modal */}
      {selectedAppointment && (
        <RescheduleModal
          show={showRescheduleModal}
          handleClose={() => setShowRescheduleModal(false)}
          handleConfirm={handleConfirmReschedule}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

export default UpcomingAppointment;
