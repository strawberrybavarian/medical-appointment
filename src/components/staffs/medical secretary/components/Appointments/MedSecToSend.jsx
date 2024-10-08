import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Table, Container, Pagination, Form, Row, Col, Button, Dropdown } from 'react-bootstrap';
import AssignAppointmentModal from './AssignAppointmentModal'; // Import the new modal component
import './Styles.css';
import UploadLabResultModal from "./modal/UploadLabResultModal";
const MedSecToSend = ({ allAppointments, setAllAppointments }) => {
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
  const [showUploadModal, setShowUploadModal] = useState(false);


  const handleUploadModalShow = (appointment) => {
    setSelectedAppointment(appointment);
    setShowUploadModal(true);
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
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
    .filter(appointment => appointment.status === 'To-send')
    .filter(appointment => 
      appointment.patient && 
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

  // Function to update the appointment status to 'Completed'
  const handleUpdateStatus = (appointmentId) => {
    axios.put(`http://localhost:8000/appointments/${appointmentId}/status`, { status: 'Completed' })
      .then((response) => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentId ? { ...appointment, status: 'Completed' } : appointment
          )
        );
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        setError("Failed to update the appointment status.");
      });
  };


  const handleSuccess = () => {
    // You can refresh the appointments list or handle success action here
  };

  return (
    <>
    <Container>
      <h3>To-send Laboratory Results</h3>
      <hr />

      <Table responsive striped variant="light" className="mt-3">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Service</th>
            <th onClick={() => handleSort('date')}>Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
            <th onClick={() => handleSort('time')}>Time {sortConfig.key === 'time' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
            <th>Appointment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAppointments.map((appointment) => {
            const patient = appointment.patient;
            const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
            const appointmentTypes = appointment.appointment_type.map(typeObj => typeObj.appointment_type).join(', ');

            return (
              <tr key={appointment._id}>
                <td style={{ fontSize: '14px', fontWeight: '600' }}>{patientName}</td>
                <td style={{ fontSize: '14px' }}>{appointmentTypes}</td>
                <td style={{ fontSize: '14px' }}>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "Not Assigned"}</td>
                <td style={{ fontSize: '14px' }}>{appointment.time || "Not Assigned"}</td>
                <td>
                  <div className="d-flex justify-content-center">
                    <div className="forpayment-appointment" style={{ fontSize: '12px' }}>
                      {appointment.status}
                    </div>
                  </div>
                </td>
                <td>
                  {/* Triple-dot Dropdown for Actions */}
                  <Dropdown>
                    <Dropdown.Toggle variant="link" id="dropdown-basic">
                      &#x22EE; {/* Triple dots (Ellipsis) */}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleUpdateStatus(appointment._id)}>
                        Mark as Completed
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleUploadModalShow(appointment)}>
                        Send Lab Results
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
      </Container>

      {selectedAppointment && (
        <UploadLabResultModal
          show={showUploadModal}
          handleClose={handleUploadModalClose}
          patientId={selectedAppointment.patient._id}
          appointmentId={selectedAppointment._id}
          onSuccess={handleSuccess}
        />
      )}
    </Container>
  </>
  );
};

export default MedSecToSend;
