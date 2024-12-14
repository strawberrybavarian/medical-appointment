import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Table, Container, Pagination, Form, Row, Col, Dropdown, Button } from 'react-bootstrap';
import './Styles.css';
import { ip } from '../../../../../ContentExport';
import { toast, ToastContainer } from 'react-toastify';
import { ThreeDots } from 'react-bootstrap-icons';
function MedSecOngoing({ allAppointments, setAllAppointments }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [alldoctors, setalldoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((result) => {
        setalldoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const ongoingAppointment = (appointmentID) => {
    const newStatus = { status: 'Ongoing' };
    axios.put(`${ip.address}/api/medicalsecretary/api/${appointmentID}/ongoing`, newStatus)
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
  };

  // Function to convert 24-hour time to 12-hour format with AM/PM
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

  // Filter appointments based on criteria
  const filteredAppointments = allAppointments
    .filter(appointment => appointment.status === 'Ongoing')
    .filter(appointment => 
      `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    )
    .filter(appointment => selectedDoctor === "" || appointment.doctor?._id === selectedDoctor)
    .filter(appointment => selectedAccountStatus === "" || appointment.patient.accountStatus === selectedAccountStatus);

  // Pagination logic
  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const appointment = allAppointments.find(app => app._id === appointmentId);
  
    // Check if the appointment has time and services assigned
    const isValidAppointment =
      appointment.time &&
      appointment.time !== "Not Assigned" &&
      appointment.appointment_type &&
      appointment.appointment_type.length > 0 &&
      appointment.appointment_type.some(type => type.appointment_type);
  
    if (!isValidAppointment) {
      // Show a toast if required details are missing
      toast.warning('To schedule an appointment, please assign a time and select the services.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
  
    try {
      const response = await axios.put(
        `${ip.address}/api/appointments/${appointmentId}/status`,
        { status: newStatus }
      );
  
      if (response.status === 200 && response.data) {
        const updatedAppointment = response.data;
  
        // Update the state with the new status
        setAllAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: updatedAppointment.status }
              : appointment
          )
        );
  
        console.log('Appointment status updated successfully:', updatedAppointment);
      } else {
        throw new Error('Unexpected server response');
      }
    } catch (err) {
      console.error('Error updating status:', err);
  
      const errorMessage =
        err.response?.data?.message || 'Failed to update the appointment status.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <>
      <Container>
     
          <h3>Ongoing Appointments</h3>
          <hr/>
          <Container className="p-0">
            <Row className="g-3">
              {/* Doctor Filter */}
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

              {/* Patient Search Input */}
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

              {/* Account Status Filter */}
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

          {/* Appointment Table */}
          <Table responsive striped variant="light" className="mt-3">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Doctor Name</th>
                <th>Service</th> 
                <th>Date</th>
                <th>Time</th> {/* Add Time column */}
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;

                // Handle missing doctor gracefully
                const doctor = appointment.doctor;
                const doctorName = doctor 
                  ? `${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}` 
                  : 'No Doctor Assigned';

                // If appointment_type is an array of objects, extract the type names
                const appointmentTypes = appointment.appointment_type
                  .map(typeObj => typeObj.appointment_type) // Extract the service type name
                  .join(', ');

                return (
                  <tr key={appointment._id}>
                    <td style={{fontSize: '14px'}}>{patientName}</td>
                    <td style={{fontSize: '14px'}}>{doctorName}</td>
                    <td style={{fontSize: '14px'}}>{appointmentTypes}</td>
                    <td style={{fontSize: '14px'}}>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td style={{fontSize: '14px'}}>{convertTimeRangeTo12HourFormat(appointment.time)}</td> {/* Add time format conversion */}
                    <td style={{fontSize: '14px'}}>{appointment.reason}</td>
                    <td>

                        <div className="d-flex justify-content-center">
                          <div className="ongoing-appointment" style={{fontSize: '12px'}}>
                            {appointment.status}
                          </div>
                        </div>
                    </td>
                    <td>
                    <div className="d-flex justify-content-around flex-wrap">
                        <Dropdown >
                          <Dropdown.Toggle s as={Button} variant="light" className="action-button">
                            <ThreeDots size={20} />
                          </Dropdown.Toggle>

                          <Dropdown.Menu style={{zIndex:'99999'}}>
                            {/* {(  !appointment.date || !appointment.time || !appointmentTypes || !categoryTypes) && ( */}

                            {/* )} */}
                            
                            {appointment.patient.accountStatus === "Unregistered" && (
                              <>
                                <Dropdown.Item
                                  onClick={() => handleUpdateStatus(appointment._id, "Scheduled")}
                                  className="action-item"
                                >
                                  Scheduled
                                </Dropdown.Item>


                              </>
                             
                            )}
                            {appointment.patient.accountStatus === "Registered" && (
                              <>
                                <Dropdown.Item
                                  onClick={() => handleUpdateStatus(appointment._id, "Scheduled")}
                                  className="action-item"
                                >
                                  Scheduled
                                </Dropdown.Item>


                              </>
                             
                            )}
                            <Dropdown.Item
                              onClick={() => handleUpdateStatus(appointment._id, "Cancelled")}
                              className="action-item"
                            >
                              Cancel
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* Pagination */}
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

      </Container>
    </>
  );
}

export default MedSecOngoing;
