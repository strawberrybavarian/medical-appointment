import axios from "axios";
import React, { useState } from "react";
import Table from 'react-bootstrap/Table';
import { Row, Col, Pagination, Form, Collapse } from 'react-bootstrap';
import './Appointment.css';
import { ip } from "../../../ContentExport";
import Swal from 'sweetalert2';

const TodaysAppointment = ({ allAppointments, setAllAppointments }) => {
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Entries per page state
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [expandedRow, setExpandedRow] = useState(null); // State to track the expanded row
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

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
    // Show confirmation dialog and wait for user response
    Swal.fire({
      title: "Confirmation",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      text: `Are you sure you want to mark this appointment as ${newStatus}?`,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      // Only proceed if the user confirmed
      if (result.isConfirmed) {
        axios.put(`${ip.address}/api/appointments/${appointmentID}/status`, { status: newStatus })
          .then((response) => {
            // Update the appointment status locally in the state
            setAllAppointments(prevAppointments =>
              prevAppointments.map(appointment =>
                appointment._id === appointmentID ? { ...appointment, status: newStatus } : appointment
              )
            );
            setError(""); // Clear error if successful
            
            // Show success message
            Swal.fire({
              title: "Success!",
              text: `Appointment status updated to ${newStatus}`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false
            });
          })
          .catch(err => {
            console.error(err); // Log detailed error
            setError('Failed to update the appointment status.');
            
            // Show error message
            Swal.fire({
              title: "Error",
              text: "Failed to update the appointment status.",
              icon: "error"
            });
          });
      }
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

  // Function to toggle expanded row
  const toggleRow = (appointmentId) => {
    setExpandedRow(expandedRow === appointmentId ? null : appointmentId); // Toggle the expanded row
  };

  const convertTimeRangeTo12HourFormat = (timeRange) => {
    // Check if the timeRange is missing or empty
    if (!timeRange) return 'Not Assigned';
  
    const convertTo12Hour = (time) => {
      // Handle single time values like "10:00"
      if (!time) return '';
  
      let [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 or 12 to 12 in 12-hour format
  
      return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };
  
    // Handle both single times and ranges
    if (timeRange.includes(' - ')) {
      const [startTime, endTime] = timeRange.split(' - ');
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    } else {
      return convertTo12Hour(timeRange); // Single time case
    }
  };

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
            {currentAppointments.map(appointment => {
              const patient = appointment.patient;

              // Ensure patient object exists before accessing its properties
              const patientName = patient
                ? `${patient.patient_firstName} ${patient.patient_middleInitial ? patient.patient_middleInitial + "." : ""} ${patient.patient_lastName}`
                : "No Patient Info";  // Fallback if patient is undefined or null
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
                    <td><img alt='Patient Image' src={patientImage} style={{marginRight:'10px', width: '30px', height:'30px', borderRadius:'100px'}}/> <span style={{fontSize: '14px', fontWeight: '600'}}>{patientName}</span> </td>
                    <td style={{fontSize: '14px'}}>{appointmentTypes}</td>
                    <td style={{fontSize: '14px'}}>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td style={{fontSize: '14px'}}>{appointment.time ? convertTimeRangeTo12HourFormat(appointment.time) : 'Not Assigned' }</td>                    
                    <td style={{ textAlign: "center" }}>
                      <div className="d-flex justify-content-center">
                        <div className="scheduled-appointment" style={{fontSize: '12px'}}>
                          {appointment.status}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Form.Check
                      type="checkbox"
                      disabled={true}
                      checked={appointment.followUp || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFollowUpChange(appointment._id, e.target.checked);
                      }}
                    />
                    </td>
                    <td>
                      {/* Ongoing Button */}
                      <button
                        style={{ color: 'green', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        onClick={() => updateAppointmentStatus(appointment._id, 'Ongoing')}
                      >
                        Ongoing
                      </button>
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
    </>
  );
};

export default TodaysAppointment;
