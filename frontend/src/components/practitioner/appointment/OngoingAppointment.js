// OngoingAppointment.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import { Button, Pagination, Form, Row, Col, Collapse } from 'react-bootstrap';
import './Appointment.css';
import RescheduleModal from "./Reschedule Modal/RescheduleModal";
import { ip } from "../../../ContentExport";

const OngoingAppointment = ({ allAppointments, setAllAppointments }) => {
  const location = useLocation();
  const { did } = location.state || {}; 
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Entries per page state
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [expandedRow, setExpandedRow] = useState(null); // State to track expanded row

  // State for rescheduling
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Handle reschedule click
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleFollowUpChange = (appointmentId, checked) => {
    axios.put(`${ip.address}/api/appointments/${appointmentId}/followup`, { followUp: checked })
      .then(() => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentId ? { ...appointment, followUp: checked } : appointment
          )
        );
      })
      .catch((err) => {
        console.error("Error updating follow-up:", err);
      });
  };

  // Handle confirm reschedule
  const handleConfirmReschedule = (rescheduledReason) => {
    const newStatus = {
      rescheduledReason: rescheduledReason,
      status: 'Rescheduled'
    };
    axios.put(`${ip.address}/api/doctor/${selectedAppointment._id}/rescheduledstatus`, newStatus)
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

  useEffect(() => {
    setAppointments(allAppointments);
  }, [allAppointments]);

  const handleUpdateStatus = (appointmentId, newStatus) => {
    axios.put(`${ip.address}/api/appointments/${appointmentId}/status`, { status: newStatus })
      .then((response) => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentId ? { ...appointment, status: newStatus } : appointment
          )
        );
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        setError("Failed to update the appointment status.");
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

  // Function to toggle expanded row
  const toggleRow = (appointmentId) => {
    setExpandedRow(expandedRow === appointmentId ? null : appointmentId); // Toggle the expanded row
  };

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

        <Table responsive striped variant="light" className="mt-3">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Follow Up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map((appointment) => {
              const patient = appointment.patient;
              const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
              const appointmentTypes = appointment.appointment_type
              .map(typeObj => typeObj.appointment_type)
              .join(', ');
              const patientImage = `${ip.address}/${patient.patient_image}` || `${ip.address}/${defaultImage}`;

              return (
                <React.Fragment key={appointment._id}>
                  <tr
                    onClick={() => toggleRow(appointment._id)} // Click to toggle collapse
                    style={{ cursor: 'pointer' }}
                  >
                    <td><img alt='Patient' src={patientImage} style={{ marginRight:'10px', width: '30px', height:'30px', borderRadius:'100px' }}/>{patientName}</td>
                    <td>{appointmentTypes}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <div className="ongoing-appointment">
                          {appointment.status}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Form.Check
                      type="checkbox"
                      checked={appointment.followUp || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFollowUpChange(appointment._id, e.target.checked);
                      }}
                    />
                    </td>
                    <td>
                      <div>
                        <Link
                          to="/information"
                          state={{ pid: appointment.patient._id, did: did, apid: appointment._id }}
                        >
                          Px Management
                        </Link>
                        {' | '}
                        {/* <span 
                          onClick={(e) => { e.stopPropagation(); handleReschedule(appointment); }} 
                          style={{ cursor: 'pointer', color: 'orange', textDecoration: 'underline', marginLeft: '5px' }}
                        >
                          Reschedule
                        </span>
                        {' | '} */}
                        <span 
                          style={{ color: 'green', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }} 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appointment._id, 'For Payment'); }}
                        >
                          For Payment
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Collapsible row for "Reason" */}
                  <tr>
                    <td colSpan="7" style={{ padding: 0 }}>
                      <Collapse in={expandedRow === appointment._id}>
                        <div style={{ padding: '10px', backgroundColor: '#f8f9fa', transition: 'height 0.35s ease'}}>
                          <strong>Reason:</strong> {appointment.reason}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
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
    </>
  );
};

export default OngoingAppointment;
