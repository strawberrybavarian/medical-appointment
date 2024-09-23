import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';

function AppointmentModal({ show, handleClose, pid, did, doctorName }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availability, setAvailability] = useState({});
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [doctorServices, setDoctorServices] = useState([]); // Services from dr_services or all services
    const [selectedServices, setSelectedServices] = useState([]); // Store selected services (appointment_type)

    // Fetch doctor's services (dr_services) or all services when the doctor is optional
    useEffect(() => {
        if (did) {
            // If a doctor ID is provided, fetch the doctor's specific services
            axios.get(`http://localhost:8000/doctor/${did}`)
                .then((response) => {
                    const doctor = response.data.doctor;
                    setDoctorServices(doctor.dr_services || []); // Assuming dr_services is populated
                    setAvailability(doctor.availability || {});
                    setActiveAppointmentStatus(doctor.activeAppointmentStatus);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            // If no doctor ID, fetch all services
            axios.get(`http://localhost:8000/admin/get/services`)
                .then((response) => {
                    setDoctorServices(response.data); // Assuming this returns all services
                    setActiveAppointmentStatus(true); // All services available for selection
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [did]);

    // Function to handle checkbox change for services
    const handleServiceChange = (serviceId) => {
        setSelectedServices((prevSelected) => {
            if (prevSelected.includes(serviceId)) {
                return prevSelected.filter((id) => id !== serviceId); // Remove service if already selected
            } else {
                return [...prevSelected, serviceId]; // Add service if not selected
            }
        });
    };

    // Function to create an appointment
    const createAppointment = () => {
        if (!date) {
            window.alert("Please select a valid date for the appointment.");
            return;
        }

        // Create the appointment data
        const formData = {
            doctorId: did || null, // doctorId can be null if optional
            date,
            time: time || null,
            reason,
            appointment_type: selectedServices, // Send selected services as appointment_type
        };

        axios.post(`http://localhost:8000/patient/api/${pid}/createappointment`, formData)
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

    const getAvailableTimes = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) return [];

        let times = [];
        if (dayAvailability.morning?.available) {
            const morningTime = `${new Date(`1970-01-01T${dayAvailability.morning.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${dayAvailability.morning.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            times.push({ label: "Morning", timeRange: morningTime });
        }

        if (dayAvailability.afternoon?.available) {
            const afternoonTime = `${new Date(`1970-01-01T${dayAvailability.afternoon.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${dayAvailability.afternoon.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            times.push({ label: "Afternoon", timeRange: afternoonTime });
        }

        return times;
    };

    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];
            setAvailableTimes(getAvailableTimes(day));
        } else {
            setAvailableTimes([]);
        }
    }, [date, did, availability]);

    const todayDate = getTodayDate();

    return (
        <Modal show={show} onHide={handleClose} className='am-overlay'>
            <div className="am-content">
                <Modal.Header className="am-header" closeButton>
                    <Modal.Title>Book Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Your Doctor: {doctorName || 'No Doctor Selected (Optional)'}</p>
                    {activeAppointmentStatus ? (
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

                            {availableTimes.length > 0 && (
                                <Row>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Time (Optional)</Form.Label>
                                        <div>
                                            {availableTimes.map((timeSlot, index) => (
                                                <Button
                                                    key={index}
                                                    variant={time === timeSlot.timeRange ? "secondary" : "outline-primary"}
                                                    onClick={() => setTime(timeSlot.timeRange)}
                                                    className="m-1"
                                                >
                                                    {timeSlot.label}: {timeSlot.timeRange}
                                                </Button>
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Row>
                            )}

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

                            {/* List services as checkboxes */} 
                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Services (Appointment Type)</Form.Label>
                                    <div>
                                        {doctorServices.map(service => (
                                            <Form.Check
                                                key={service._id}
                                                type="checkbox"
                                                label={service.name}
                                                onChange={() => handleServiceChange(service.name)}
                                                checked={selectedServices.includes(service.name)}
                                                disabled={service.availability === 'Not Available' || service.availability === 'Coming Soon'}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                            </Row>
                        </Form>
                    ) : (
                        <p>Doctor is not accepting appointments currently.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    {activeAppointmentStatus && (
                        <Button variant="primary" onClick={createAppointment}>
                            Submit
                        </Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AppointmentModal;
