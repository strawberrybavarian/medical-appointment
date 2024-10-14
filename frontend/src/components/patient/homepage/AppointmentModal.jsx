import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal, Table, Alert } from 'react-bootstrap';
import { ip } from "../../../ContentExport";

function AppointmentModal({ show, handleClose, serviceId, pid }) {
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [service, setService] = useState(null); // To store fetched service details
    const [error, setError] = useState(""); // To handle error messages
    const [showConfirmation, setShowConfirmation] = useState(false); // To handle confirmation modal visibility

    // Fetch the service details based on the serviceId 
    useEffect(() => {
        if (serviceId) {
            axios.get(`${ip.address}/api/admin/services/${serviceId}`)
                .then((response) => {
                    setService(response.data); // Set the fetched service details
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [serviceId]);

    // Function to open confirmation modal
    const openConfirmationModal = () => {
        setError(""); // Clear any previous errors

        // Check if service availability is not "Not Available" or "Coming Soon"
        if (service.availability === "Not Available" || service.availability === "Coming Soon") {
            setError("This service is not currently available for booking.");
            return;
        }

        if (!date) {
            setError("Please select a valid date for the appointment.");
            return;
        }

        // Open the confirmation modal
        setShowConfirmation(true);
    };

    // Function to create an appointment (called after confirmation)
    const confirmAppointment = () => {
        // Create the appointment data, including the service name (appointment type)
        const formData = {
            serviceId: serviceId, // The selected service
            appointment_type: [
                {
                    appointment_type: service.name,  // Service name (e.g., Blood Chem)
                    category: service.category       // Service category (e.g., Lab Test)
                }
            ], // Add the service name as the appointment type
            date,
            reason,
        };

        axios.post(`${ip.address}/api/patient/api/${pid}/createappointment`, formData)
            .then(() => {
                handleClose(); // Close the modal on success
                window.location.reload(); // Reload to reflect changes
            })
            .catch((err) => {
                if (err.response) {
                    setError(`Error: ${err.response.data.message}`);
                } else {
                    setError('An error occurred while creating the appointment.');
                }
            });
    };

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayDate = getTodayDate();

    return (
        <>
            <Modal show={show} onHide={handleClose} className='am-overlay'>
                <div>
                    <Modal.Header className="am-header" closeButton>
                        <Modal.Title>Book Appointment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {service ? (
                            <>
                                <Table striped bordered hover>
                                    <tbody>
                                        <tr>
                                            <td><strong>Service Name</strong></td>
                                            <td>{service.name} ({service.category})</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Description</strong></td>
                                            <td>{service.description}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Availability</strong></td>
                                            <td>{service.availability}</td>
                                        </tr>
                                    </tbody>
                                </Table>

                                <Form>
                                    {/* Display error message inside the form */}
                                    {error && (
                                        <Alert variant="danger">
                                            {error}
                                        </Alert>
                                    )}

                                    <Row>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                min={todayDate}
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                required
                                                disabled={service.availability === "Not Available" || service.availability === "Coming Soon"}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Primary Concern</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                disabled={service.availability === "Not Available" || service.availability === "Coming Soon"}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <p style={{ fontSize: 'small', fontStyle: 'italic' }}>*The time and date may change depending on service availability, so please always chat with our staff to confirm.</p>
                                </Form>
                            </>
                        ) : (
                            <p>Loading service details...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={openConfirmationModal} // Open confirmation modal
                            disabled={service && (service.availability === "Not Available" || service.availability === "Coming Soon")} // Disable if service is unavailable
                        >
                            Submit
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Service:</strong> {service?.name} ({service?.category})</p>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Primary Concern:</strong> {reason || "None"}</p>
                    <p>Do you want to confirm this appointment?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmAppointment}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AppointmentModal;
