import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, Container, Pagination, Form, Row, Col, Nav } from 'react-bootstrap';
import './Appointment.css';
import RescheduleModal from "./Reschedule Modal/RescheduleModal";
import { ip } from "../../../ContentExport";

const TodaysAppointment = () => {
  const location = useLocation();
  const { did } = location.state || {}; 
  const [allAppointments, setAllAppointments] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Number of entries per page
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    axios
    .get(`${ip.address}/doctor/appointments/${did}`)
    .then((res) => {
      setAllAppointments(res.data);
    })
    .catch((err) => {
      setError("Error fetching appointments");
      console.log(err);
    });
  }, [did]);

  const updateAppointmentStatus = (appointmentID, newStatus) => {
    axios.put(`${ip.address}/appointments/${appointmentID}/status`, { status: newStatus })
      .then(() => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentID ? { ...appointment, status: newStatus } : appointment
          )
        );
      })
      .catch(err => console.log(err));
  };

  const handleConfirmReschedule = (rescheduledReason) => {
    const newStatus = {
      rescheduledReason: rescheduledReason,
      status: 'Rescheduled'
    };
    axios.put(`${ip.address}/doctor/${selectedAppointment._id}/rescheduledstatus`, newStatus)
      .then(() => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === selectedAppointment._id ? { ...appointment, status: 'Rescheduled', rescheduledReason: rescheduledReason } : appointment
          )
        );
        setCurrentPage(1); // Reset to first page after accepting an appointment
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  const filteredAppointments = sortedAppointments.filter(appointment => 
    appointment.status === 'Pending' &&
    (`${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()))
  );

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
    <Container className="white-background shadow-lg">
      <div style={{ padding: '30px', width: '100%' }}>
        <div style={{ marginTop: '20px', width: '100%' }}>
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
                  <Col xs={12} md={4} className="">
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
        </div>
        
        <Table responsive striped  variant="light" className="mt-3">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th style={{  cursor: 'pointer' }} onClick={() => handleSort('time')}>
                Time {sortConfig.key === 'time' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th >Reason</th>
              <th >Status</th>
              <th >Actions</th>
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
                    <div className="pending-appointment">
                          {appointment.status}
                    </div>
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    <Nav onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}>
                      {/* <Nav.Item>
                        <Nav.Link 
                          className="accept-link" 
                          onClick={() => updateAppointmentStatus(appointment._id, 'Scheduled')}>
                          Accept
                        </Nav.Link>
                      </Nav.Item> */}

                      <Nav.Item>
                        <Nav.Link 
                          className="reschedule-link" 
                          onClick={() => handleReschedule(appointment)}>
                          Reschedule
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        </Table>
        {error && <p>{error}</p>}
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

      {selectedAppointment && (
        <RescheduleModal 
          show={showRescheduleModal} 
          handleClose={handleCloseRescheduleModal} 
          appointment={selectedAppointment} 
          handleConfirm={handleConfirmReschedule}
        />
      )}
    </Container>
  );
};

export default TodaysAppointment;
