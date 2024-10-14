import React, { useState, useEffect } from "react";
import { Table, Container, Pagination, Dropdown, Form, Toast } from 'react-bootstrap';
import axios from "axios";
import { useParams } from "react-router-dom";
import UploadLabResultsModal from "./modal/UploadLabResultsModal";
import { ip } from "../../../../../ContentExport";
const MedSecToSend = ({ allAppointments, setAllAppointments }) => {
  const { did } = useParams();
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showSendModal, setShowSendModal] = useState(false); // Modal state for "Send Laboratory"
  const [file, setFile] = useState(null);  // To store the uploaded file
  const [showToast, setShowToast] = useState(false);  // Success toast state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [alldoctors, setAllDoctors] = useState([]);  // State for doctors

  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
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

  // Filter appointments by patient name based on the search term
  const filteredAppointments = sortedAppointments
    .filter(appointment => appointment.status === 'To-send')
    .filter(appointment => 
      appointment.patient && 
      `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) // Search filter applied here
    );

  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  // Handle file upload for sending laboratory
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  // Handle sending the laboratory result
  const handleSendLabResult = async () => {
    if (!file) {
        setError('Please select a file before submitting.');
        return;
    }

    const labData = new FormData();
    labData.append('file', file);

    // Log the form data before sending
    console.log('Sending file:', file);

    try {
        const response = await axios.post(
            `${ip.address}/api/doctor/api/createLaboratoryResult/${selectedAppointment.patient._id}/${selectedAppointment._id}`,
            labData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        
        console.log('Response from server:', response.data); // Log the response from the server
        
        setShowToast(true);  // Show success toast
        setFile(null);  // Reset file after upload
        setShowSendModal(false);  // Close modal after successful upload
    } catch (err) {
        setError('Failed to send laboratory result');
        console.error('Error during file upload:', err.response?.data || err.message);
    }
};


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

  return (
    <Container>
      <h3>To-send Laboratory Results</h3>
      <hr/>

      {/* Toast for success */}
      <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
        <Toast.Body>Laboratory result sent successfully!</Toast.Body>
      </Toast>

      {/* Search field for filtering patient names */}
      <Form.Group className="mb-3">
        <Form.Label>Search Patient Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter patient name"
          value={searchTerm} // Binds search term to input value
          onChange={(e) => setSearchTerm(e.target.value)} // Updates search term on input change
        />
      </Form.Group>

      <Table responsive striped variant="light" className="mt-3">
        <thead>
          <tr>
            <th>Patient Name</th>
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

            return (
              <tr key={appointment._id}>
                <td>{patientName}</td>
                <td>{appointment.appointment_type.map(typeObj => typeObj.appointment_type).join(', ')}</td>
                <td>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "Not Assigned"}</td>
                <td>{appointment.time || "Not Assigned"}</td>
                <td>{appointment.status}</td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                      Actions
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => { setSelectedAppointment(appointment); setShowSendModal(true); }}>
                        Send Laboratory
                      </Dropdown.Item>
                      <Dropdown.Item
                                onClick={() => handleUpdateStatus(appointment._id, "Completed")}
                                className="action-item"
                              >
                                Complete
                              </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

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

      {/* Modal for uploading and previewing laboratory result */}
      <UploadLabResultsModal
        show={showSendModal}
        handleClose={() => setShowSendModal(false)}
        file={file}
        handleFileChange={handleFileChange}
        handleSubmit={handleSendLabResult}
      />
    </Container>
  );
};

export default MedSecToSend;