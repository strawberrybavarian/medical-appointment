import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Table, Container, Pagination, Form, Row, Col, Button } from 'react-bootstrap';
import AssignAppointmentModal from './AssignAppointmentModal'; 
import './Styles.css';

const MedSecPending = ({ allAppointments, setAllAppointments }) => {
  const { did } = useParams();
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [alldoctors, setAllDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Convert 24-hour format to 12-hour format (for display)
  const convertTo12HourFormat = (time24h) => {
    if (!time24h) return ''; // Return empty string if no time
    const [hours, minutes] = time24h.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert to 12-hour format
    return `${hour12}:${minutes} ${period}`;
  };

  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/alldoctor`)
      .then((result) => {
        setAllDoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const getUniqueCategories = () => {
    const categories = allAppointments.flatMap(appointment => 
      appointment.appointment_type.map(typeObj => typeObj.category)
    );
    return [...new Set(categories)];
  };

  const uniqueCategories = getUniqueCategories();

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAppointments = [...allAppointments].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredAppointments = sortedAppointments
    .filter(appointment => appointment.status === 'Pending')
    .filter(appointment => 
      appointment.patient && 
      `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    )
    .filter(appointment => selectedDoctor === "" || appointment.doctor?._id === selectedDoctor)
    .filter(appointment => selectedAccountStatus === "" || appointment.patient.accountStatus === selectedAccountStatus)
    .filter(appointment => 
      categoryFilter === "" || 
      appointment.appointment_type.some(typeObj => typeObj.category === categoryFilter)
    );

  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleAssignDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  const handleSaveDetails = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please fill all the fields.");
      return;
    }
  
    const updatedAppointment = {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
    };
  
    axios.put(`http://localhost:8000/api/appointment/${selectedAppointment._id}/assign`, updatedAppointment)
      .then(() => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === selectedAppointment._id ? { ...appointment, ...updatedAppointment, status: "Scheduled" } : appointment
          )
        );
        setShowAssignModal(false);
        setError("");
      })
      .catch((err) => {
        console.log(err);
        setError("An error occurred while saving the details.");
      });
  };

  const handleUpdateStatus = (appointmentId) => {
    axios.put(`http://localhost:8000/appointments/${appointmentId}/status`, { status: 'Scheduled' })
      .then((response) => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentId ? { ...appointment, status: 'Scheduled' } : appointment
          )
        );
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        setError("Failed to update the appointment status.");
      });
  };

  return (
    <>
      <Container>
        <div style={{ padding: '30px', width: '100%' }}>
          <h1>Pending Appointments</h1>
          <Container className="p-0">
            <Row>
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
                      <option key={doctor?._id} value={doctor?._id}>
                        {`${doctor?.dr_firstName} ${doctor?.dr_middleInitial}. ${doctor?.dr_lastName}`}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

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

              <Col lg={4} md={6} sm={12}>
                <Form.Group controlId="formCategoryFilter" className="d-flex align-items-center">
                  <Form.Label style={{ marginRight: '1vh' }}>Category:</Form.Label>
                  <Form.Control
                    as="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
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
                <th onClick={() => handleSort('date')}>
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('time')}>
                  Time {sortConfig.key === 'time' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Account Status</th>
                <th>Appointment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
                const doctor = appointment.doctor;
                const doctorName = doctor
                  ? `${doctor?.dr_firstName} ${doctor?.dr_middleInitial}. ${doctor?.dr_lastName}`
                  : "Not Assigned";
                  const appointmentTypes = appointment.appointment_type
                  .map(typeObj => typeObj.appointment_type)
                  .join(', ');

                  const categoryTypes = appointment.appointment_type
                  .map(typeObj => typeObj.category)
                  .join(', ');

                return (
                  <tr key={appointment._id}>
                    <td>{patientName}</td>
                    <td>{doctorName}</td>
                    <td>{categoryTypes}</td>
                    <td>{appointmentTypes}</td>
                    <td>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "Not Assigned"}</td>
                    <td>{convertTo12HourFormat(appointment.time) || "Not Assigned"}</td>
                    <td>{appointment.patient.accountStatus}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                      <div className="pending-appointment">
                            {appointment.status}
                      </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-around flex-wrap">
                        {(!appointment.doctor || !appointment.date || !appointment.time) && (
                          <Link variant="warning" onClick={() => handleAssignDetails(appointment)}>Assign Details</Link>
                        )}
                        {(appointment.doctor && appointment.date && appointment.time && appointment.status !== "Scheduled") && (
                          <Link variant="success" onClick={() => handleUpdateStatus(appointment._id)}>
                            Scheduled
                          </Link>
                        )}
                      </div>
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

        {selectedAppointment && (
          <AssignAppointmentModal
            show={showAssignModal}
            handleClose={() => setShowAssignModal(false)}
            alldoctors={alldoctors}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            handleSaveDetails={handleSaveDetails}
            appointmentId={selectedAppointment?._id}
            pid={selectedAppointment?.patient?._id} 
            error={error}
          />
        )}

        <div style={{ paddingBottom: '50px' }} />
      </Container>
    </>
  );
};

export default MedSecPending;
