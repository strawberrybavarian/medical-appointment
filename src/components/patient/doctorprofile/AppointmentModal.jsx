import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect } from "react";
import './DoctorProfile.css';

function AppointmentModal({ show, handleClose, pid, did, doctorName }) {
    const navigate = useNavigate();
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availability, setAvailability] = useState({});
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [services, setServices] = useState([]); // For available services (acting as appointment_type)
    const [selectedServices, setSelectedServices] = useState([]); // Store selected services (appointment_type)

    // Fetch available services from the backend
    useEffect(() => {
        axios.get("http://localhost:8000/admin/get/services")
            .then((response) => {
                setServices(response.data); // Assuming response.data contains the services array
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // Function to handle checkbox change for services
    const handleServiceChange = (serviceName) => {
        setSelectedServices((prevSelected) => {
            if (prevSelected.includes(serviceName)) {
                // Remove service if it's already selected
                return prevSelected.filter((name) => name !== serviceName);
            } else {
                // Add the service if it's not selected
                return [...prevSelected, serviceName];
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
            doctorId: did, // Optional, might be null
            date,
            time: time || null, // Time is optional, so only include if selected
            reason,
            appointment_type: selectedServices, // Send selected services as appointment_type
        };

        axios.post(`http://localhost:8000/patient/api/${pid}/createappointment`, formData)
            .then((response) => {
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

    // Get today's date
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
        if (dayAvailability.morning.available) {
            const morningTime = `${new Date(`1970-01-01T${dayAvailability.morning.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${dayAvailability.morning.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            times.push({ label: "Morning", timeRange: morningTime });
        }

        if (dayAvailability.afternoon.available) {
            const afternoonTime = `${new Date(`1970-01-01T${dayAvailability.afternoon.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${dayAvailability.afternoon.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            times.push({ label: "Afternoon", timeRange: afternoonTime });
        }

        return times;
    };

    // Fetch available times when the date changes
    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];

            const times = getAvailableTimes(day);
            setAvailableTimes(times);
        } else {
            setAvailableTimes([]);
        }
    }, [date, did, availability]);

    // Fetch doctor's availability when component mounts or when `did` changes
    useEffect(() => {
        if (did) {
            axios.get(`http://localhost:8000/doctor/${did}/available`)
                .then((response) => {
                    const { availability, activeAppointmentStatus } = response.data;
                    setAvailability(availability);
                    setActiveAppointmentStatus(activeAppointmentStatus);
                })
                .catch((err) => {
                    console.log(err.response.data);
                });
        }
    }, [did]);

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
                                        placeholder="Enter Date"
                                        min={todayDate}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required // Make date required
                                    />
                                </Form.Group>
                            </Row>
                            {availableTimes.length > 0 && (
                                <Row>
                                    <Form.Group as={Col} className="mb-3">
                                        <Form.Label>Time (Optional)</Form.Label>
                                        <center>
                                            <div>
                                                {availableTimes.map((timeSlot, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={time === timeSlot.timeRange ? "secondary" : "outline-primary"} // Highlight selected button
                                                        onClick={() => setTime(timeSlot.timeRange)}
                                                        disabled={time === timeSlot.timeRange} // Disable if already selected
                                                        className="m-1"
                                                    >
                                                        {timeSlot.label}: {timeSlot.timeRange}
                                                    </Button>
                                                ))}
                                            </div>
                                        </center>
                                    </Form.Group>
                                </Row>
                            )}
                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Primary Concern</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Enter Reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>

                            {/* Add the services as checkboxes */}
                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Services (Appointment Type)</Form.Label>
                                    <div>
                                        {services.map((service) => (
                                            <Form.Check
                                                key={service._id}
                                                type="checkbox"
                                                label={service.category}
                                                value={service._id}
                                                onChange={() => handleServiceChange(service.category)}
                                                checked={selectedServices.includes(service.category)}
                                                disabled={service.availability === 'Not Available' || service.availability === 'Coming Soon'}
                                                className={service.availability === 'Not Available' || service.availability === 'Coming Soon' ? 'text-muted' : ''}
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
                        <Button onClick={createAppointment} variant="primary" type="button">
                            Submit
                        </Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AppointmentModal;
