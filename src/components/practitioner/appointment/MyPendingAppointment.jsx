import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Container, Pagination, Form, Row, Col } from 'react-bootstrap';

import './Appointment.css';
import RescheduleModal from "./Reschedule Modal/RescheduleModal";


const TodaysAppointment = () => {
  const { did } = useParams();
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
    .get(`http://localhost:8000/doctor/appointments/${did}`)
    .then((res) => {
      setAllAppointments(res.data);
    })
    .catch((err) => {
      setError("Error fetching appointments");
      console.log(err);
    });
  }, [did]);



  const acceptAppointment = (appointmentID) => {
    const newStatus = { status: 'Scheduled' };
    axios.put(`http://localhost:8000/doctor/api/${appointmentID}/acceptpatient`, newStatus)
      .then((response) => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentID ? { ...appointment, status: 'Scheduled' } : appointment
          )
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

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
        setCurrentPage(1); // Reset to first page after accepting an appointment
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //For Queries
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
    <Container className="white-background shadow-sm">
      <div style={{ padding: '30px', width: '100%' }}>
        {/* <h1>Pending Appointments</h1> */}
        
        <div style={{ marginTop: '20px', width: '100%' }}>
        <Row className="d-flex align-items-center">

        <Col xs={12} md={3} className="mb-3 d-flex align-items-center">
          <div className="d-flex align-items-center w-100">
            <Form.Label className="me-2">Entries per page:</Form.Label> {/* Add margin to right (me-2) */}
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
        
        <Table responsive striped bordered hover variant="blue" className="table-border-radius">
          <thead>
            <tr>
              <th style={{ border: "1px solid #00000018" }}>Patient Name</th>
              <th style={{ border: "1px solid #00000018", cursor: 'pointer' }} onClick={() => handleSort('date')}>
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th style={{ border: "1px solid #00000018", cursor: 'pointer' }} onClick={() => handleSort('time')}>
                Time {sortConfig.key === 'time' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th style={{ border: "1px solid #00000018" }}>Reason</th>
              <th style={{ border: "1px solid #00000018" }}>Status</th>
              <th style={{ border: "1px solid #00000018" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map((appointment) => {
              const patient = appointment.patient;
              const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
              return (
                <tr key={appointment._id}>
                  <td>{patientName}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <Button variant="success" onClick={() => acceptAppointment(appointment._id)}>Accept</Button>
                    <Button variant="warning" onClick={() => handleReschedule(appointment)}>Reschedule</Button>
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
