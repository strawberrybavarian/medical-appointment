import React, { useState, useEffect } from "react";
import { Modal, Form, Table, Pagination, InputGroup, Button, Card, Row, Col, Container } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../../ContentExport";

function PastAppointmentsModal({ patientId, show, onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);
  const [selectedFindings, setSelectedFindings] = useState(null);

  useEffect(() => {
    if (show) {
      axios
        .get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((result) => {
          console.log("Past Appointments:", result.data);
          if (result.data?.thePatient?.patient_appointments) {
            const completedAppointments = result.data.thePatient.patient_appointments.filter(
              (appt) => appt.status === "Completed"
            );
            setAppointments(completedAppointments);
            setFilteredAppointments(completedAppointments); // Initialize filtered appointments
          } else {
            setAppointments([]);
            setFilteredAppointments([]);
          }
        })
        .catch((error) => console.error("Error fetching past appointments:", error));
    }
  }, [show, patientId]);

  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter((appt) =>
        `${appt.doctor?.dr_firstName} ${appt.doctor?.dr_lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((appt) => {
        const appointmentDate = new Date(appt.date).toLocaleDateString();
        return appointmentDate.includes(dateFilter);
      });
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1); // Reset to the first page whenever filters change
  }, [searchTerm, dateFilter, appointments]);

  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header className="am-header" closeButton>
        <Modal.Title>Past Completed Appointments</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Container fluid>
          <Row>
            {/* Left Side - Appointments List */}
            <Col md={6}>
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Search by doctor's name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Form.Control
                  type="date"
                  placeholder="Filter by date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={handleClearFilters}>
                  Clear
                </Button>
              </InputGroup>

              <Table responsive striped bordered>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.date).toLocaleDateString();
                    return (
                      <tr key={appointment._id}>
                        <td>{appointmentDate}</td>
                        <td>{appointment.doctor?.dr_firstName} {appointment.doctor?.dr_lastName}</td>
                        <td>
                          <Button variant="info" onClick={() => setSelectedFindings(appointment.findings)}>
                            View Information
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {/* Pagination */}
              <Pagination className="justify-content-center">
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </Col>

            {/* Right Side - Findings */}
            <Col md={6}>
              {selectedFindings && (
                <Card className="p-3">
                  <Card.Header><strong>Patient Findings</strong></Card.Header>
                  <Card.Body>
                    <Table striped bordered>
                      <tbody>
                        <tr>
                          <td><strong>Assessment:</strong></td>
                          <td>{selectedFindings.assessment || "?"}</td>
                        </tr>
                        <tr>
                          <td><strong>Blood Pressure:</strong></td>
                          <td>
                            {selectedFindings.bloodPressure
                              ? `${selectedFindings.bloodPressure.systole}/${selectedFindings.bloodPressure.diastole}`
                              : "?"}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Pulse Rate:</strong></td>
                          <td>{selectedFindings.pulseRate || "?"}</td>
                        </tr>
                        <tr>
                          <td><strong>Temperature:</strong></td>
                          <td>{selectedFindings.temperature || "?"}</td>
                        </tr>
                        <tr>
                          <td><strong>Height:</strong></td>
                          <td>{selectedFindings.height || "?"}</td>
                        </tr>
                        <tr>
                          <td><strong>Weight:</strong></td>
                          <td>{selectedFindings.weight || "?"}</td>
                        </tr>
                        <tr>
                          <td><strong>History of Present Illness:</strong></td>
                          <td>{selectedFindings.historyOfPresentIllness?.chiefComplaint || "?"}</td>
                        </tr>
                        <tr>
                          <td><strong>Recommendations:</strong></td>
                          <td>{selectedFindings.recommendations || "?"}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default PastAppointmentsModal;