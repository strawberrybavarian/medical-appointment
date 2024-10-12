import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import { ip } from "../../../ContentExport";
function AppointmentModal({ show, handleClose, serviceId, pid }) {
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [service, setService] = useState(null); // To store fetched service details

    // Fetch the service details based on the serviceId 
    useEffect(() => {
        if (serviceId) {
            axios.get(`${ip.address}/admin/services/${serviceId}`)
                .then((response) => {
                    console.log(response.data);
                    setService(response.data); // Set the fetched service details
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [serviceId]);

    // Function to create an appointment
    const createAppointment = () => {
        if (!date) {
            window.alert("Please select a valid date for the appointment.");
            return;
        }
    
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
    
        axios.post(`${ip.address}/patient/api/${pid}/createappointment`, formData)
            .then(() => {
                window.alert("Created an appointment!");
                window.location.reload();
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err.response.data);
                    window.alert(`Error: ${err.response.data.message}`);
                } else {
                    console.log(err);
                    window.alert('An error occurred while creating the appointment.');
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
        <Modal show={show} onHide={handleClose} className='am-overlay'>
            <div className="am-content">
                <Modal.Header className="am-header" closeButton>
                    <Modal.Title>Book Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {service ? (
                        <>
                            {/* Display service details */}
                            <h5>{service.name}</h5>
                            <p><strong>Category:</strong> {service.category}</p>
                            <p><strong>Description:</strong> {service.description}</p>
                            <p><strong>Availability:</strong> {service.availability}</p>
                            {service.requirements.length > 0 && (
                                <p><strong>Requirements:</strong> {service.requirements.join(", ")}</p>
                            )}

                            {/* Date and Primary Concern fields */}
                            <Form>
                                <Row>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            min={todayDate}
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
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
                                        />
                                    </Form.Group>
                                </Row>
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
                    <Button variant="primary" onClick={createAppointment}>
                        Submit
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AppointmentModal;
