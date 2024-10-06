import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Pagination, Form, Row, Col, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import RescheduleModal from '../../../../practitioner/appointment/Reschedule Modal/RescheduleModal';
import { Link } from 'react-router-dom';
import { ThreeDots } from 'react-bootstrap-icons';
function MedSecTodaysApp({ allAppointments, setAllAppointments }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [alldoctors, setalldoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // Category filter state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/alldoctor`)
      .then((result) => {
        setalldoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Helper to get today's date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const handleUpdateStatus = (appointmentId, newStatus) => {
    axios.put(`http://localhost:8000/appointments/${appointmentId}/status`, { status: newStatus })
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


  const convertTo12HourFormat = (time) => {
    if (!time) return 'Not Assigned'; 
    if (time.includes('AM') || time.includes('PM')) {
      return time; 
    }
    const [hours, minutes] = time.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; 
    return `${hour12}:${minutes} ${period}`;
  };

  const getUniqueCategories = () => {
    const categories = allAppointments.flatMap(appointment => 
      appointment.appointment_type.map(typeObj => typeObj.category)
    );
    return [...new Set(categories)]; 
  };

  const uniqueCategories = getUniqueCategories();

  const filteredAppointments = allAppointments
    .filter(appointment => appointment.status === 'Scheduled')
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      return appointmentDate === todayDate;
    })
    .filter(appointment => 
      `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    )
    .filter(appointment => selectedDoctor === "" || appointment?.doctor._id === selectedDoctor)
    .filter(appointment => selectedAccountStatus === "" || appointment.patient.accountStatus === selectedAccountStatus)
    .filter(appointment => selectedCategory === "" || appointment.appointment_type.some(typeObj => typeObj.category === selectedCategory)); // Category filter

  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCloseRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
  };

  return (
    <>
      <Container>
      
          <h3>Today's Appointments</h3>
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
                        {`${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              {/* Patient Search Input */}
              <Col lg={4} md={6} sm={12}>
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

              {/* Category Filter Dropdown */}
              <Col lg={3} md={5} sm={12}>
                <Form.Group controlId="formCategoryFilter" className="d-flex align-items-center">
                  <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Category:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Control>
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

          <Table responsive striped variant="light" className="mt-3">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Doctor Name</th>
                <th>Category</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;

                const doctor = appointment.doctor;
                const doctorName = `${doctor?.dr_firstName} ${doctor?.dr_middleInitial}. ${doctor?.dr_lastName}`;
                
                const appointmentTypes = appointment.appointment_type
                .map(typeObj => typeObj.appointment_type)
                .join(', ');

                const categoryTypes = appointment.appointment_type
                .map(typeObj => typeObj.category)
                .join(', ');

                return (
                  <tr key={appointment._id}>
                    <td style={{fontSize: '14px'}}>{patientName}</td>
                    <td style={{fontSize: '14px'}}>{doctorName}</td>
                    <td style={{fontSize: '14px'}}>{categoryTypes}</td>
                    <td style={{fontSize: '14px'}}>{appointmentTypes}</td>
                    <td style={{fontSize: '14px'}}>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td style={{fontSize: '14px'}}> {convertTo12HourFormat(appointment.time)}</td> {/* Convert time to 12-hour AM/PM format */}
                
                    <td >
                      <div className="d-flex justify-content-center">
                        <div className="scheduled-appointment" style={{fontSize: '12px'}}>
                          {appointment.status}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Dropdown >
                        <Dropdown.Toggle as={Button} variant="light" className="action-button">
                          <ThreeDots size={20} />
                        </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleUpdateStatus(appointment._id, "Ongoing")}
                              className="action-item"
                            >
                              Ongoing
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => handleReschedule(appointment)}
                              className="action-item"
                            >
                              Reschedule
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => handleUpdateStatus(appointment._id, "Cancelled")}
                              className="action-item"
                            >
                              Cancel
                            </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
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

            {selectedAppointment && (
              <RescheduleModal 
                show={showRescheduleModal} 
                handleClose={handleCloseRescheduleModal} 
                appointment={selectedAppointment} 
                handleConfirm={handleConfirmReschedule}
              />
            )}
          </Container>
    
      </Container>
    </>
  );
}

export default MedSecTodaysApp;
