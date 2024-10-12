import React, { useState } from "react";
import { Table, Button, Container, Pagination, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../ContentExport";
import InexactAmountModal from "./modal/InexactAmountModal";
import ProofOfPaymentModal from "./modal/ProofOfPaymentModal";

function UnpaidPatient({ allAppointments, setAllAppointments }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showInexactModal, setShowInexactModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [inexactAmount, setInexactAmount] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [patientName, setPatientName] = useState("");
 

  
  const handleInexact = (appointmentID) => {
    setSelectedAppointment(appointmentID);
    setShowInexactModal(true);
  };

  const handleProofView = (proofOfPayment, patientName) => {
    setProofOfPayment(proofOfPayment);
    setPatientName(patientName);
    setShowProofModal(true);
  };

  const handleInexactModalClose = () => {
    setShowInexactModal(false);
    setInexactAmount("");
    setSelectedAppointment(null);
  };

  const handleProofModalClose = () => {
    setShowProofModal(false);
    setProofOfPayment(null);
    setPatientName("");
  };

  const handleInexactSubmit = () => {
    // Optimistically update the UI before making the API call
    setAllAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === selectedAppointment
          ? { ...appointment, payment: { ...appointment.payment, paymentStatus: "Inexact", inexactAmount: parseFloat(inexactAmount) } }
          : appointment
      )
    );
  
    const newStatus = { paymentStatus: "Inexact", inexactAmount: parseFloat(inexactAmount) };
  
    axios
      .put(`${ip.address}/appointments/${selectedAppointment}/payment-status`, newStatus)
      .then((response) => {
        console.log(`Payment status updated to Inexact with amount: ${inexactAmount} for appointment ID: ${selectedAppointment}`);
      })
      .catch((err) => {
        console.error("Error updating payment status:", err);
        // Roll back the change if the API call fails
        setAllAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === selectedAppointment
              ? { ...appointment, payment: { ...appointment.payment, paymentStatus: "Unpaid", inexactAmount: null } } // Assume the previous status was "Unpaid"
              : appointment
          )
        );
      })
      .finally(() => {
        handleInexactModalClose();
      });
  };
  

  const updatePaymentStatus = (appointmentID, status) => {
    // Store the previous status for rollback in case of an error
    const previousStatus = allAppointments.find(appointment => appointment._id === appointmentID)?.payment?.paymentStatus;
  
    // Optimistically update the UI before making the API call
    setAllAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === appointmentID
          ? { ...appointment, payment: { ...appointment.payment, paymentStatus: status } }
          : appointment
      )
    );
  
    const newStatus = { paymentStatus: status };
  
    axios
      .put(`${ip.address}/appointments/${appointmentID}/payment-status`, newStatus)
      .then((response) => {
        console.log(`Payment status updated to ${status} for appointment ID: ${appointmentID}`);
      })
      .catch((err) => {
        console.error("Error updating payment status:", err);
        
        // Roll back the change if the API call fails
        setAllAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === appointmentID
              ? { ...appointment, payment: { ...appointment.payment, paymentStatus: previousStatus } }
              : appointment
          )
        );
      });
  };
  

  const filteredAppointments = allAppointments
  .filter(
    (appointment) => appointment.payment && appointment.payment.paymentStatus === "Unpaid"
  )
  .filter((appointment) =>
    appointment.patient &&
    `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .filter((appointment) =>
    selectedStatus === "" || appointment.status === selectedStatus
  );


  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredAppointments.length / entriesPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div style={{ padding: "5rem", width: "100%" }}>
      <Container className="p-0">
        <h1>Unpaid Payments</h1>
        <Row className="g-3">
          <Col lg={4} md={6} sm={12} className="p-0">
            <Form.Group controlId="formSearch" className="d-flex align-items-center">
              <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Patient Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </Form.Group>
          </Col>
          <Col lg={4} md={6} sm={12} className="p-0">
            <Form.Group controlId="formStatus" className="d-flex align-items-center">
              <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Appointment Status:</Form.Label>
              <Form.Control
                as="select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </Container>

        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Mode of Payment</th>
              <th>Proof</th>
              <th>Payment Status</th>
              <th>Appointment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {currentAppointments.map((appointment) => {
  console.log(appointment.payment); // Log payment details to debug
  const patient = appointment.patient;
  const patientName = patient ? `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}` : "Unknown Patient";

  return (
    <tr key={appointment._id}>
      <td>{patientName}</td>
      <td>{new Date(appointment.date).toLocaleDateString()}</td>
      <td>{appointment.payment?.paymentMethod}</td> {/* Optional chaining for safety */}
      <td>
      {appointment.payment.proofOfPayment ? (
                    <a
                      href="#"
                      className="link-primary"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        handleProofView(appointment.payment.proofOfPayment, patientName);
                      }}
                    >
                      View Image
                    </a>
                  ) : (
                    "No"
                  )}
      </td>
      <td>{appointment.payment?.paymentStatus}</td> {/* Optional chaining for safety */}
      <td>{appointment.status}</td>
      <td>
        <Button
          variant="warning"
          onClick={() => handleInexact(appointment._id)}
        >
          Inexact
        </Button>
        <Button
          variant="primary"
          onClick={() => updatePaymentStatus(appointment._id, "Paid")}
        >
          Mark as Paid
        </Button>
      </td>
    </tr>
  );
})}

          </tbody>
        </Table>

        <Container className="d-flex justify-content-between p-0">
          <Container className="d-flex p-0 align-content-center">
            <Row>
              <Container>
                <label>Entries per page:</label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </Container>
            </Row>
          </Container>

          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {pageNumbers.map((number) => (
              <Pagination.Item
                key={number}
                active={number === currentPage}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pageNumbers.length)
                )
              }
              disabled={currentPage === pageNumbers.length}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(pageNumbers.length)}
              disabled={currentPage === pageNumbers.length}
            />
          </Pagination>
        </Container>
      </div>

      <InexactAmountModal
        show={showInexactModal}
        handleClose={handleInexactModalClose}
        handleSubmit={handleInexactSubmit}
        inexactAmount={inexactAmount}
        setInexactAmount={setInexactAmount}
      />

      <ProofOfPaymentModal
        show={showProofModal}
        handleClose={handleProofModalClose}
        patientName={patientName}
        proofOfPayment={proofOfPayment}
      />
    </>
  );
}

export default UnpaidPatient;
