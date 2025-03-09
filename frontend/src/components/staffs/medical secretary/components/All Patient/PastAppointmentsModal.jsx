import React, { useState, useEffect } from "react";
import { Modal, Form, Table, Pagination, InputGroup, Button, Card, Row, Col, Container, Badge, Spinner } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../../ContentExport";
import GeneratePDF from "../../../../patient/patientinformation/Patient History/GeneratePDF";
import { Calendar3, Search, FileEarmarkMedical, ClipboardData, XCircle } from "react-bootstrap-icons";

function PastAppointmentsModal({ patientId, show, onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);
  const [selectedFindings, setSelectedFindings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && patientId) {
      setLoading(true);
      axios
        .get(`${ip.address}/api/patient/api/onepatient/${patientId}`)
        .then((result) => {
          if (result.data?.thePatient?.patient_appointments) {
            const completedAppointments = result.data.thePatient.patient_appointments.filter(
              (appt) => appt.status === "Completed"
            );
            setAppointments(completedAppointments);
            setFilteredAppointments(completedAppointments);
          } else {
            setAppointments([]);
            setFilteredAppointments([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching past appointments:", error);
          setLoading(false);
        });
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
    setCurrentPage(1);
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
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="xl" 
      centered 
      dialogClassName=""
    >
      <Modal.Header closeButton className="">
        <Modal.Title>
          <FileEarmarkMedical size={22} className="me-2" />
          Past Medical Records
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <Container fluid>
          <Row>
            {/* Left Side - Appointments List */}
            <Col lg={5} md={12} className="mb-4 mb-lg-0">
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0 fw-bold">Appointments History</h5>
                </Card.Header>
                
                <Card.Body className="p-3">
                  <Row className="mb-3">
                    <Col className="mb-2 mb-md-0 mb-1">
                      <InputGroup>
                        <InputGroup.Text className="bg-white mb-1 app-form-control">
                          <Search size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search doctor name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-start-0"
                        />
                      </InputGroup>
                  
             
                      <InputGroup>
                        <InputGroup.Text className="bg-white app-form-control">
                          <Calendar3 size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="border-start-0"
                        />
                      </InputGroup>
                      </Col>
                  </Row>
                  
                  {searchTerm || dateFilter ? (
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        Found {filteredAppointments.length} results
                      </small>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={handleClearFilters}
                        className="py-1 px-2"
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : null}

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Loading appointments...</p>
                    </div>
                  ) : currentAppointments.length > 0 ? (
                    <div className="appointment-list">
                      {currentAppointments.map((appointment, index) => (
                        <Card 
                          key={appointment._id}
                          className={`mb-2 border-0 appointment-card ${selectedFindings?._id === appointment._id ? 'selected-appointment' : ''}`}
                          onClick={() => setSelectedFindings(appointment)}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1 fw-bold">
                                  {appointment.doctor?.dr_firstName} {appointment.doctor?.dr_lastName}
                                </h6>
                                <div className="text-muted small">
                                  <Calendar3 size={12} className="me-1" />
                                  {formatDate(appointment.date)}
                                </div>
                              </div>
                              <Badge bg="info" pill className="px-3 py-2">
                                View
                              </Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <ClipboardData size={40} className="text-muted mb-2" />
                      <p className="text-muted">No completed appointments found</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {!loading && filteredAppointments.length > appointmentsPerPage && (
                    <div className="mt-3">
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
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Right Side - Findings */}
            <Col lg={7} md={12}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0 fw-bold">Medical Record Details</h5>
                </Card.Header>
                <Card.Body className="p-3 record-details-body">
                  {selectedFindings ? (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h6 className="mb-1 text-primary">
                            {selectedFindings.doctor?.dr_firstName} {selectedFindings.doctor?.dr_lastName}
                          </h6>
                          <div className="text-muted">
                            <Calendar3 size={14} className="me-1" />
                            {formatDate(selectedFindings.date)}
                          </div>
                        </div>
                        <div>
                          <GeneratePDF 
                            record={selectedFindings.findings} 
                            doctorFullName={`${selectedFindings.doctor?.dr_firstName} ${selectedFindings.doctor?.dr_lastName}`} 
                          />
                        </div>
                      </div>

                      <Row>
                        <Col md={6} className="mb-4">
                          <Card className="border-0 bg-light h-100">
                            <Card.Body className="p-3">
                              <h6 className="text-primary mb-3">Vitals</h6>
                              <Table borderless size="sm" className="findings-table">
                                <tbody>
                                  <tr>
                                    <td className="text-muted">Blood Pressure:</td>
                                    <td className="fw-medium">
                                      {selectedFindings.findings?.bloodPressure
                                        ? `${selectedFindings.findings?.bloodPressure.systole}/${selectedFindings.findings?.bloodPressure.diastole} mmHg`
                                        : "Not recorded"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="text-muted">Pulse Rate:</td>
                                    <td className="fw-medium">
                                      {selectedFindings.findings?.pulseRate 
                                        ? `${selectedFindings.findings?.pulseRate} bpm`
                                        : "Not recorded"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="text-muted">Temperature:</td>
                                    <td className="fw-medium">
                                      {selectedFindings.findings?.temperature 
                                        ? `${selectedFindings.findings?.temperature} °C`
                                        : "Not recorded"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="text-muted">Height:</td>
                                    <td className="fw-medium">
                                      {selectedFindings.findings?.height 
                                        ? `${selectedFindings.findings?.height} cm`
                                        : "Not recorded"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="text-muted">Weight:</td>
                                    <td className="fw-medium">
                                      {selectedFindings.findings?.weight 
                                        ? `${selectedFindings.findings?.weight} kg`
                                        : "Not recorded"}
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6} className="mb-4">
                          <Card className="border-0 bg-light h-100">
                            <Card.Body className="p-3">
                              <h6 className="text-primary mb-3">Assessment</h6>
                              <p className="mb-0">
                                {selectedFindings.findings?.assessment || "No assessment recorded"}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={12} className="mb-4">
                          <Card className="border-0 bg-light">
                            <Card.Body className="p-3">
                              <h6 className="text-primary mb-2">History of Present Illness</h6>
                              <p className="mb-0">
                                {selectedFindings.findings?.historyOfPresentIllness?.chiefComplaint || "No history recorded"}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={12}>
                          <Card className="border-0 bg-light">
                            <Card.Body className="p-3">
                              <h6 className="text-primary mb-2">Recommendations</h6>
                              <p className="mb-0">
                                {selectedFindings.findings?.recommendations || "No recommendations recorded"}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FileEarmarkMedical size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">Select an appointment to view medical details</h5>
                      <p className="text-muted">Click on any appointment from the list to view the medical record</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default PastAppointmentsModal;